import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin, Toast} from 'ionic-native';
import {DbService} from './db.service';
import {SettingService} from './setting.service';

@Injectable()
export class AudioService {
  trackIndexSubject: Subject<number> = new Subject<number>();
  currentTrack: any = {};
  intervalGetCurrentPosition: any;
  listTrack: MediaPlugin[] = null;
  listWord: any[];
  listWordOrder: number[];
  isPlaying: boolean = false;
  isLoop: boolean = false;
  isShuffle: boolean = false;
  singleWordIndex: number;
  // basePath: string = 'file:///storage/emulated/0/Android/data/io.techybrain.app_nihongo/files/';
  basePath: string = 'file:///android_asset/www/audio/';

  constructor(private dbService: DbService, private settingService: SettingService) {
    this.currentTrack.seekTime = '00:00';
    this.currentTrack.duration = '00:00';
  }

  toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.isLoop) {
      Toast.hide();
      Toast.showShortCenter('Repeating all tracks').subscribe(() => {});
    } else {
      Toast.hide();
      Toast.showShortCenter('Repeat is off').subscribe(() => {});
    }
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    if (this.isShuffle) {
      Toast.hide();
      Toast.showShortCenter('Shuffle is on').subscribe(() => {});
    } else {
      Toast.hide();
      Toast.showShortCenter('Shuffle is off').subscribe(() => {});
    }
  }

  private convertText(seconds) {
    let text = '';
    seconds = Math.floor(seconds);
    if (Math.floor(seconds / 3600) > 0) {
      let hours = Math.floor(seconds / 3600).toString();
      while (hours.length < 2) hours = '0' + hours;
      text += hours;
    }
    seconds = seconds % 3600;
    let minutes = Math.floor(seconds / 60).toString();
    while (minutes.length < 2) minutes = '0' + minutes;
    seconds = (seconds % 60).toString();
    while (seconds.length < 2) seconds = '0' + seconds;
    text += `${minutes}:${seconds}`;
    return text;
  }

  private getListWordOrder() {
    this.listWordOrder = this.listWord.map((word, index) => index);
    if (this.isShuffle) {
      for (let i = this.listWordOrder.length - 1; i >= 0; --i) {
        let k = Math.floor(Math.random() * (i + 1));
        let temp = this.listWordOrder[i];
        this.listWordOrder[i] = this.listWordOrder[k];
        this.listWordOrder[k] = temp;
      }
    }
  }

  playSetting() {
    this.listWord = this.settingService.selectedWords;
    this.getListWordOrder();
    this.stopListTrack();
    this.generateListTrack();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  private generateListTrack() {
    this.listTrack = [];
    this.listWordOrder.forEach((wordIndex, index) => {
      let word = this.listWord[wordIndex];
      this.listTrack.push(new MediaPlugin(`${this.basePath}${word.audioFile}.mp3`));
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
    this.listTrack[this.currentTrack.index].release();
    // this.listTrack[this.currentTrack.index].seekTo(0);
    this.currentTrack.index += 1;
    if (this.currentTrack.index == this.listTrack.length) {
      this.currentTrack.playedPercent = 100;
      this.currentTrack.seekTime = this.convertText(this.getTotalDuration());
      this.currentTrack.index = 0;
      if (this.isLoop) {
        this.trackIndexSubject.next(this.currentTrack.index);
        this.playCurrentTrack();
      } else {
        this.isPlaying = false;
        this.pauseCurrentTrack();
      }
    } else {
      Toast.showLongTop(`${JSON.stringify(this.listWord[this.listWordOrder[this.currentTrack.index]])}`).subscribe(() => {});
      this.trackIndexSubject.next(this.currentTrack.index);
      this.playCurrentTrack();
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
        alert('ERROR getCurrentPosition ' + JSON.stringify(err));
      })
    }, 1000);
  }

  private stopGetCurrentPositionInterval() {
    clearInterval(this.intervalGetCurrentPosition);
    this.intervalGetCurrentPosition = null;
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
      // this.listTrack[this.currentTrack.index].seekTo(0);
      this.currentTrack.index = nextIndex;
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
      this.currentTrack.index = nextIndex;
      if (continuePlaying)
        this.playCurrentTrack();
      this.currentTrack.seekTime = this.convertText(position);
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.seekTo(0);
    }
  }

  repeatCurrentTrack() {
    Toast.hide();
    Toast.showShortTop('Repeat current vocabulary').subscribe(() => {});
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

