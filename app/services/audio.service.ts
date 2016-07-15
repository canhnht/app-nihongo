import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin, Toast} from 'ionic-native';
import {CourseService} from './course.service';

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
  playSingleWord: boolean = false;
  singleWordIndex: number;

  constructor(private courseService: CourseService) {
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
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60).toString();
    while (minutes.length < 2) minutes = '0' + minutes;
    seconds = (seconds % 60).toString();
    while (seconds.length < 2) seconds = '0' + seconds;
    return `${minutes}:${seconds}`;
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

  playPlaylists(listWord) {
    this.playSingleWord = false;
    this.listWord = listWord;
    this.getListWordOrder();
    this.stopListTrack();
    this.generateListTrack();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  playWordInPlaylist(listWord, wordIndex) {
    this.playSingleWord = true;
    this.singleWordIndex = wordIndex;
    this.listWord = listWord;
    this.getListWordOrder();
    this.stopListTrack();
    this.listTrack = [
      new MediaPlugin(`file:///android_asset/www/audio/audio${wordIndex % 3 + 1}.mp3`)
    ];
    this.listTrack[0].play();
    this.listTrack[0].pause();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  playListWordInPlaylist(listWord, listWordNumber) {
    this.playSingleWord = false;
    this.listWord = [];
    listWord.forEach(word => {
      if (listWordNumber.indexOf(word.number) >= 0)
        this.listWord.push(Object.assign({}, word));
    });
    this.getListWordOrder();
    this.stopListTrack();
    this.generateListTrack();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  playListUnit(listUnit) {
    this.playSingleWord = false;
    let currentCourse = this.courseService.currentCourse;
    this.listWord = [];
    currentCourse.units.forEach(unit => {
      if (listUnit.indexOf(unit.number) >= 0) {
        this.listWord = this.listWord.concat(unit.words);
      }
    });
    this.getListWordOrder();
    this.stopListTrack();
    this.generateListTrack();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  playListWord(listWord) {
    this.playSingleWord = false;
    let currentCourse = this.courseService.currentCourse;
    this.listWord = [];
    currentCourse.units.forEach(unit => {
      unit.words.forEach(word => {
        if (listWord.indexOf(word.number) >= 0)
          this.listWord.push(Object.assign({}, word));
      });
    });
    this.getListWordOrder();
    this.stopListTrack();
    this.generateListTrack();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
  }

  private generateListTrack() {
    this.listTrack = [];
    this.listWordOrder.forEach((wordIndex, index) => {
      this.listTrack.push(new MediaPlugin(`file:///android_asset/www/audio/audio${wordIndex % 3 + 1}.mp3`));
      this.listTrack[index].play();
      this.listTrack[index].pause();
    });
  }

  playWord(unitNumber, wordIndex) {
    this.playSingleWord = true;
    this.singleWordIndex = wordIndex;
    let currentCourse = this.courseService.currentCourse;
    this.listWord = [];
    currentCourse.units.forEach(unit => {
      if (unit.number === unitNumber) {
        this.listWord = unit.words;
      }
    });
    this.getListWordOrder();
    this.stopListTrack();
    this.listTrack = [
      new MediaPlugin(`file:///android_asset/www/audio/audio${wordIndex % 3 + 1}.mp3`)
    ];
    this.listTrack[0].play();
    this.listTrack[0].pause();
    this.currentTrack.index = 0;
    this.playCurrentTrack();
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
    this.listTrack[this.currentTrack.index].seekTo(0);
    this.currentTrack.index += 1;
    if (this.currentTrack.index == this.listTrack.length) {
      this.currentTrack.index = 0;
      if (this.isLoop) {
        this.trackIndexSubject.next(this.currentTrack.index);
        this.playCurrentTrack();
      } else {
        this.isPlaying = false;
        this.pauseCurrentTrack();
      }
    } else {
      this.trackIndexSubject.next(this.currentTrack.index);
      this.playCurrentTrack();
    }
  }

  private getTotalDuration() {
    let totalDuration = this.listTrack.reduce((sum, track) => {
      return sum + track.getDuration();
    }, 0);
    return totalDuration;
  }

  private getPlayedDurationUntil(trackIndex) {
    let playedDuration = 0;
    this.listTrack.forEach((track, index) => {
      if (index < trackIndex) {
        playedDuration += track.getDuration();
      }
    });
    return playedDuration;
  }

  private startGetCurrentPositionInterval() {
    this.intervalGetCurrentPosition = setInterval(() => {
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      let duration = this.getTotalDuration();
      this.currentTrack.durationInSeconds = duration;
      this.currentTrack.duration = this.convertText(Math.max(duration, 0));
      let playedDuration = this.getPlayedDurationUntil(this.currentTrack.index);
      track.getCurrentPosition().then(position => {
        if (position >= 0) {
          position += playedDuration;
          this.currentTrack.playedPercent = Math.ceil(position / duration * 100);
          this.currentTrack.seekTime = this.convertText(position);
        } else {
          this.goToNextTrack();
        }
      });
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
    if (this.listTrack) {
      let seconds = Math.max(this.getTotalDuration(), 0);
      seconds = seconds * percent / 100;
      let nextIndex: number = this.getNextTrackIndex(seconds);
      if (nextIndex != this.currentTrack.index) {
        this.trackIndexSubject.next(nextIndex);
        let continuePlaying = this.currentTrack.isPlaying;
        this.pauseCurrentTrack();
        this.listTrack[this.currentTrack.index].seekTo(0);
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
  }

  getNextTrackIndex(seconds: number) {
    let nextIndex: number = 0;
    while (seconds > this.listTrack[nextIndex].getDuration()) {
      nextIndex += 1;
      seconds -= this.listTrack[nextIndex].getDuration();
    }
    return nextIndex;
  }

  seekToWord(index) {
    if (this.playSingleWord) {
      let wordIndex = this.listWordOrder[index];
      if (this.singleWordIndex !== wordIndex) {
        this.singleWordIndex = wordIndex;
        let continuePlaying = this.currentTrack.isPlaying;
        this.pauseCurrentTrack();
        this.listTrack[0].release();
        this.listTrack[0] = new MediaPlugin(`file:///android_asset/www/audio/audio${wordIndex % 3 + 1}.mp3`);
        this.currentTrack.index = 0;
        this.currentTrack.seekTime = '00:00';
        this.currentTrack.playedPercent = 0;
        if (continuePlaying) this.playCurrentTrack();
      }
      return;
    }
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
    Toast.showShortBottom('Repeat current vocabulary').subscribe(() => {});
    this.pauseCurrentTrack();
    this.listTrack[this.currentTrack.index].seekTo(0);
    this.playCurrentTrack();
  }

  generateListWordOrder() {
    if (this.isShuffle) {
      if (this.playSingleWord) {
        let index = this.listWordOrder.indexOf(this.singleWordIndex);
        for (let i = index - 1; i >= 0; --i) {
          let k = Math.floor(Math.random() * (i + 1));
          let temp = this.listWordOrder[i];
          this.listWordOrder[i] = this.listWordOrder[k];
          this.listWordOrder[k] = temp;
        }
        for (let i = this.listWordOrder.length - 1; i > index; --i) {
          let k = index + 1 + Math.floor(Math.random() * (i - index));
          let temp = this.listWordOrder[i];
          this.listWordOrder[i] = this.listWordOrder[k];
          this.listWordOrder[k] = temp;
        }
      } else {
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
      }
    } else {
      if (this.playSingleWord) {
        this.listWordOrder = this.listWord.map((word, index) => index);
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
}

