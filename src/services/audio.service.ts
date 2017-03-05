import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MediaPlugin, Toast, File } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import _ from 'lodash';
import { DbService } from './db.service';
import { SettingService } from './setting.service';
import { LocalStorageService } from './local-storage.service';
import { formatSecondsAsHHMMSS } from '../helpers/main-helper';
import * as utils from '../helpers/utils';

declare var cordova: any;

@Injectable()
export class AudioService {
  trackIndexSubject: Subject<number> = new Subject<number>();
  currentTrack: any = {};
  intervalGetCurrentPosition: any;
  intervalBetweenWords: any;
  listTrack: MediaPlugin[] = null;
  listWord: any[];
  listWordOrder: number[];
  isPlaying: boolean = false;
  isLoop: boolean = false;
  isShuffle: boolean = false;
  singleWordIndex: number;
  repeatEachWord: any = 1;
  timeBetweenWords: any = 0;

  constructor(private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService, private storageService: LocalStorageService) {
    this.currentTrack.seekTime = '00:00';
    this.currentTrack.duration = '00:00';
  }

  toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.isLoop) {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Repeating_all')).subscribe(() => {});
    } else {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Repeat_off')).subscribe(() => {});
    }
  }

  resetLoop(){
    this.isLoop = false;
  }

  resetShuffle(){
    this.isShuffle = false;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    if (this.isShuffle) {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Shuffle_on')).subscribe(() => {});
    } else {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Shuffle_off')).subscribe(() => {});
    }
  }

  private convertText(seconds) {
    return formatSecondsAsHHMMSS(seconds);
  }

  private getListWordOrder() {
    this.listWordOrder = this.listWord.map((word, index) => index);
    if (this.isShuffle) {
      this.listWordOrder = _.shuffle(this.listWordOrder);
    }
  }

  playSetting() {
    this.listWord = [...this.settingService.selectedWords];
    let localPromise = [
      this.storageService.get('repeat_each_word'),
      this.storageService.get('time_between_words')
    ];
    return Promise.all(localPromise).then(result => {
      this.repeatEachWord = result[0];
      this.timeBetweenWords = result[1];
      this.listWord.forEach(word => word.repeatCount = 0);
      this.getListWordOrder();
      this.stopListTrack();
      return this.generateListTrack();
    }).then(() => {
      this.currentTrack.index = 0;
      this.dbService.updateAnalytic(this.listWord[this.listWordOrder[0]]);
      this.playCurrentTrack();
    });
  }

  private generateListTrack() {
    let audioUrlsPromise = this.listWordOrder.map((wordIndex) => {
      let word = this.listWord[wordIndex];
      return utils.resolveIntervalUrl(`${cordova.file.dataDirectory}${word.audioFolder}`, word.audioFile);
    });
    return Promise.all(audioUrlsPromise).then((audioUrls) => {
      this.listTrack = [];
      audioUrls.forEach((url) => {
        this.listTrack.push(new MediaPlugin(url));
      });
    });
  }

  playCurrentTrack() {
    this.isPlaying = true;
    let track: MediaPlugin = this.listTrack[this.currentTrack.index];
    this.currentTrack.isPlaying = true;
    track.play();
    this.startGetCurrentPositionInterval();
  }

  goToNextTrack() {
    this.pauseCurrentTrack();
    let wordIndex = this.listWordOrder[this.currentTrack.index];
    this.listWord[wordIndex].repeatCount += 1;
    if (this.listWord[wordIndex].repeatCount < this.repeatEachWord) {
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.seekTo(0);
      this.playCurrentTrack();
      return;
    }
    this.listWord[wordIndex].repeatCount = 0;
    this.listTrack[this.currentTrack.index].release();
    this.currentTrack.index += 1;
    if (this.currentTrack.index === this.listTrack.length) {
      this.currentTrack.playedPercent = 100;
      this.currentTrack.seekTime = this.convertText(this.getTotalDuration());
      this.currentTrack.index = 0;
      if (this.isLoop) {
        this.dbService.updateAnalytic(this.listWord[this.listWordOrder[this.currentTrack.index]]);
        this.startCountDown(this.timeBetweenWords, () => {
          this.trackIndexSubject.next(this.currentTrack.index);
          this.playCurrentTrack();
        });
      } else {
        this.trackIndexSubject.next(this.currentTrack.index);
        this.currentTrack.playedPercent = 0;
        this.currentTrack.seekTime = this.convertText(0);
        this.isPlaying = false;
        this.settingService.stopAudio();
        this.pauseCurrentTrack();
      }
    } else {
      this.dbService.updateAnalytic(this.listWord[this.listWordOrder[this.currentTrack.index]]);
      this.startCountDown(this.timeBetweenWords, () => {
        this.trackIndexSubject.next(this.currentTrack.index);
        this.playCurrentTrack();
      });
    }
  }

  private getTotalDuration() {
    let totalDuration = this.listWordOrder.reduce((sum, wordIndex) => {
      return sum + this.listWord[wordIndex].audioDuration;
    }, 0);
    return totalDuration;
  }

  private getPlayedDurationUntil(trackIndex) {
    let playedDuration = 0;
    this.listWordOrder.forEach((wordIndex, index) => {
      if (index < trackIndex) {
        playedDuration += this.listWord[wordIndex].audioDuration;
      }
    });
    return playedDuration;
  }

  private startGetCurrentPositionInterval() {
    let duration = this.getTotalDuration();
    let playing = false;
    this.intervalGetCurrentPosition = setInterval(() => {
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      this.currentTrack.durationInSeconds = duration;
      this.currentTrack.duration = this.convertText(Math.max(duration, 0));
      let playedDuration = this.getPlayedDurationUntil(this.currentTrack.index);
      track.getCurrentPosition().then(position => {
        if (position >= 0) {
          playing = true;
          position += playedDuration;
          this.currentTrack.playedDuration = position;
          this.currentTrack.playedPercent = Math.ceil(position / duration * 100);
          this.currentTrack.seekTime = this.convertText(position);
        } else if (playing) {
          this.goToNextTrack();
        }
      }).catch(err => {
        Toast.showShortBottom(this.translate.instant('Error_audio')).subscribe(() => {});
      })
    }, 1000);
  }

  private stopGetCurrentPositionInterval() {
    clearInterval(this.intervalGetCurrentPosition);
    this.intervalGetCurrentPosition = null;
  }

  private startCountDown(timeAmount, action) {
    if (timeAmount <= 0) return action();
    let countDown: number = timeAmount;
    Toast.showShortTop(this.translate.instant('Next_word_countdown', {
      seconds: countDown
    })).subscribe(() => {});
    this.intervalBetweenWords = setInterval(() => {
      --countDown;
      if (countDown === 0) {
        this.stopCountDown();
        action();
      } else {
        Toast.hide();
        Toast.showShortTop(this.translate.instant('Next_word_countdown', {
          seconds: countDown
        })).subscribe(() => {});
      }
    }, 1000);
  }

  stopCountDown() {
    clearInterval(this.intervalBetweenWords);
    this.intervalBetweenWords = null;
  }

  pauseCurrentTrack() {
    this.stopGetCurrentPositionInterval();
    this.currentTrack.isPlaying = false;
    if (this.listTrack) {
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.pause();
    }
  }

  private stopListTrack() {
    this.pauseCurrentTrack();
    this.releaseListTrack();
  }

  private releaseListTrack() {
    if (this.listTrack) {
      this.listTrack.forEach(track => track.release());
    }
  }

  seekPercent(percent) {
    this.currentTrack.playedPercent = percent;
    let seconds = Math.max(this.getTotalDuration(), 0);
    seconds = seconds * percent / 100;
    let nextIndex: number = this.getNextTrackIndex(seconds);
    if (nextIndex != this.currentTrack.index) {
      this.trackIndexSubject.next(nextIndex);
      let continuePlaying = this.currentTrack.isPlaying;
      this.pauseCurrentTrack();
      this.listTrack[this.currentTrack.index].release();
      this.listWord[this.listWordOrder[this.currentTrack.index]].repeatCount = 0;
      this.currentTrack.index = nextIndex;
      this.listWord[this.listWordOrder[nextIndex]].repeatCount = 0;
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      if (continuePlaying)
        this.playCurrentTrack();
      this.currentTrack.seekTime = this.convertText(seconds);
      seconds -= this.getPlayedDurationUntil(this.currentTrack.index);
      track.seekTo(Math.round(seconds * 1000));
    } else {
      this.currentTrack.seekTime = this.convertText(seconds);
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      seconds -= this.getPlayedDurationUntil(this.currentTrack.index);
      track.seekTo(Math.round(seconds * 1000));
    }
  }

  getNextTrackIndex(seconds: number) {
    let nextIndex: number = 0;
    while (seconds > this.listWord[this.listWordOrder[nextIndex]].audioDuration) {
      nextIndex += 1;
      seconds -= this.listWord[this.listWordOrder[nextIndex]].audioDuration;
    }
    return nextIndex;
  }

  seekToWord(index) {
    let nextIndex = index;
    let duration = this.getTotalDuration();
    let position = this.getPlayedDurationUntil(nextIndex);
    if (nextIndex != this.currentTrack.index) {
      this.currentTrack.playedPercent = Math.ceil(position / duration * 100);
      let continuePlaying = this.currentTrack.isPlaying;
      this.pauseCurrentTrack();
      this.listTrack[this.currentTrack.index].seekTo(0);
      this.listWord[this.listWordOrder[this.currentTrack.index]].repeatCount = 0;
      this.currentTrack.index = nextIndex;
      this.listWord[this.listWordOrder[nextIndex]].repeatCount = 0;
      if (continuePlaying)
        this.playCurrentTrack();
      this.currentTrack.seekTime = this.convertText(position);
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.seekTo(0);
    }
  }

  repeatCurrentTrack() {
    Toast.hide();
    Toast.showShortTop('Repeat current word').subscribe(() => {});
    this.pauseCurrentTrack();
    this.listTrack[this.currentTrack.index].seekTo(0);
    this.playCurrentTrack();
  }

  generateListWordOrder() {
    if (this.isShuffle) {
      let index = this.currentTrack.index;
      for (let i = index - 1; i >= 0; --i) {
        let k = Math.floor(Math.random() * (i + 1));
        let temp = this.listWordOrder[i];
        this.listWordOrder[i] = this.listWordOrder[k];
        this.listWordOrder[k] = temp;

        let tempTrack = this.listTrack[i];
        this.listTrack[i] = this.listTrack[k];
        this.listTrack[k] = tempTrack;
      }
      for (let i = this.listWordOrder.length - 1; i > index; --i) {
        let k = index + 1 + Math.floor(Math.random() * (i - index));
        let temp = this.listWordOrder[i];
        this.listWordOrder[i] = this.listWordOrder[k];
        this.listWordOrder[k] = temp;

        let tempTrack = this.listTrack[i];
        this.listTrack[i] = this.listTrack[k];
        this.listTrack[k] = tempTrack;
      }
    } else {
      let wordIndex = this.listWordOrder[this.currentTrack.index];
      let tempListTrack = new Array<any>(this.listTrack.length);
      this.listTrack.forEach((track, index) => {
        tempListTrack[this.listWordOrder[index]] = track;
      });
      this.listWordOrder = this.listWord.map((word, index) => index);
      this.listTrack = tempListTrack;
      this.currentTrack.index = wordIndex;
    }
  }
}

