import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin, Toast} from 'ionic-native';
import {LIST_VOCABULARY} from './list-vocabulary.data';

@Injectable()
export class AudioService {
  trackIndexSubject: Subject<number> = new Subject<number>();
  currentTrack: any = {};
  intervalGetCurrentPosition: any;
  listTrack: MediaPlugin[] = null;
  isPlaying: boolean = false;

  constructor(http: Http) {
    this.currentTrack.seekTime = '00:00';
    this.currentTrack.duration = '00:00';
  }

  convertText(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60).toString();
    while (minutes.length < 2) minutes = '0' + minutes;
    seconds = (seconds % 60).toString();
    while (seconds.length < 2) seconds = '0' + seconds;
    return `${minutes}:${seconds}`;
  }

  playListUnit(listUnit) {
    this.isPlaying = true;
    this.stopListTrack();
    this.listTrack = [];
    LIST_VOCABULARY.forEach(vocabulary => {
      if (vocabulary.audioFile) {
        this.listTrack.push(new MediaPlugin(`/android_asset/www/audio/${vocabulary.audioFile}`));
        this.listTrack[this.listTrack.length - 1].play();
        this.listTrack[this.listTrack.length - 1].stop();
      }
    });
    this.currentTrack.index = 0;
    this.currentTrack.title = 'Course 2 - Unit 3 - Word 0';
    this.playCurrentTrack();
  }

  playVocabulary(vocabulary) {
    this.stopListTrack();
    this.currentTrack.title = 'Course 1 - Unit 2 - Word C';
    this.playCurrentTrack();
  }

  playCurrentTrack() {
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
      this.pauseCurrentTrack();
     } else {
      this.listTrack[this.currentTrack.index].stop();
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
        Toast.show(`currentPosition ${position}`, '500', 'center')
            .subscribe(() => {});
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
    Toast.show(`stopCurrentTrack`, '500', 'center')
      .subscribe(() => {});
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
        this.pauseCurrentTrack();
        this.listTrack[this.currentTrack.index].seekTo(0);
        this.currentTrack.index = nextIndex;
        this.playCurrentTrack();
        this.currentTrack.seekTime = this.convertText(seconds);
        let track: MediaPlugin = this.listTrack[this.currentTrack.index];
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

  seekToVocabulary(vocabIndex) {
    Toast.show(`seekToVocabulary ${vocabIndex}`, '500', 'top')
      .subscribe(() => {});
    let nextIndex = vocabIndex;
    let duration = this.getTotalDuration();
    let position = this.getPlayedDurationUntil(nextIndex);
    this.currentTrack.playedPercent = Math.ceil(position / duration * 100);;
    if (nextIndex != this.currentTrack.index) {
      this.pauseCurrentTrack();
      this.listTrack[this.currentTrack.index].seekTo(0);
      this.currentTrack.index = nextIndex;
      this.playCurrentTrack();
      this.currentTrack.seekTime = this.convertText(position);
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.seekTo(0);
    } else {
      this.currentTrack.seekTime = this.convertText(position);
      let track: MediaPlugin = this.listTrack[this.currentTrack.index];
      track.seekTo(0);
    }
  }
}

