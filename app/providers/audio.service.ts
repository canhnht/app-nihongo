import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin, Toast} from 'ionic-native';

@Injectable()
export class AudioService {
  currentTrackSubject: Subject<any> = new Subject<any>();
  currentTrack: any = {};
  intervalGetCurrentPosition: any;
  track: MediaPlugin = null;

  constructor(http: Http) {
    this.currentTrack.seekTime = '00:00';
    this.currentTrack.duration = '00:00';
  }

  convertText(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes}:${seconds}`;
  }

  playCourse(course) {
    this.stopCurrentTrack();
    this.currentTrack.title = 'Course 1 - Unit 1 - Word A';
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.playCurrentTrack();
  }

  playUnit(unit) {
    this.stopCurrentTrack();
    this.currentTrack.title = 'Course 2 - Unit 3 - Word B';
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.playCurrentTrack();
  }

  playVocabulary(vocabulary) {
    this.stopCurrentTrack();
    this.currentTrack.title = 'Course 1 - Unit 2 - Word C';
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.playCurrentTrack();
  }

  playCurrentTrack() {
    Toast.show(`check track ${this.track}`, '500', 'center')
      .subscribe(() => {});
    if (this.track) {
      this.currentTrack.isPlaying = true;
      this.track.play();
      this.startGetCurrentPositionInterval();
    }
  }

  startGetCurrentPositionInterval() {
    this.intervalGetCurrentPosition = setInterval(() => {
      let duration = this.track.getDuration();
      this.currentTrack.durationInSeconds = duration;
      this.currentTrack.duration = this.convertText(Math.max(duration, 0));
      this.track.getCurrentPosition().then((position) => {
        if (position >= 0 && duration >= 0) {
          this.currentTrack.playedPercent = Math.ceil(position / duration * 100);
          if (this.currentTrack.playedPercent >= 99) this.pauseCurrentTrack();
          this.currentTrack.seekTime = this.convertText(Math.max(position, 0));
        }
      });
    }, 1000);
  }

  stopGetCurrentPositionInterval() {
    Toast.show(`stopCurrentTrack`, '500', 'center')
      .subscribe(() => {});
    clearInterval(this.intervalGetCurrentPosition);
    this.intervalGetCurrentPosition = null;
  }

  pauseCurrentTrack() {
    this.stopGetCurrentPositionInterval();
    this.currentTrack.isPlaying = false;
    if (this.track) {
      this.track.pause();
    }
  }

  stopCurrentTrack() {
    this.pauseCurrentTrack();
    if (this.track) {
      this.track.release();
      this.track = null;
    }
  }

  seekPercent(percent) {
    this.currentTrack.playedPercent = percent;
    if (this.track) {
      let seconds = Math.max(this.track.getDuration(), 0);
      seconds = seconds * percent / 100;
      this.currentTrack.seekTime = this.convertText(Math.max(seconds, 0));
      this.track.seekTo(Math.round(seconds * 1000));
    }
  }
}

