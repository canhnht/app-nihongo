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
    this.currentTrack.playedTime = '00:00';
    this.currentTrack.duration = '00:00';
  }

  convertText(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes}:${seconds}`;
  }

  playCourse(course) {
    console.log('zuizui:playCourse', course);
    this.stopCurrentTrack();
    this.currentTrack.title = 'Course 1 - Unit 1 - Word A';
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.playCurrentTrack();
  }

  playUnit(unit) {
    console.log('zuizui:playUnit', unit);
    this.stopCurrentTrack();
    this.currentTrack.title = 'Course 2 - Unit 3 - Word B';
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.playCurrentTrack();
  }

  playVocabulary(vocabulary) {
    console.log('zuizui:playVocabulary', vocabulary);
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
      this.currentTrack.duration = this.convertText(Math.max(duration, 0));
      this.track.getCurrentPosition().then((position) => {
        if (position >= 0 && duration >= 0) {
          this.currentTrack.playedPercent = Math.round(position / duration * 100);
          if (this.currentTrack.playedPercent >= 99) this.stopCurrentTrack();
          this.currentTrack.playedTime = this.convertText(Math.max(position, 0));
        }
      });
    }, 1000);
  }

  stopGetCurrentPositionInterval() {
    Toast.show(`stopCurrentTrack`, '500', 'center')
      .subscribe(() => {});
    if (this.intervalGetCurrentPosition) {
      clearInterval(this.intervalGetCurrentPosition);
      this.intervalGetCurrentPosition = null;
    }
  }

  pauseCurrentTrack() {
    if (this.track) {
      this.currentTrack.isPlaying = false;
      this.track.pause();
      this.stopGetCurrentPositionInterval();
    }
  }

  stopCurrentTrack() {
    if (this.track) {
      this.pauseCurrentTrack();
      this.track.release();
      this.track = null;
    }
  }

  seek(percent) {
    let seconds = Math.max(this.track.getDuration(), 0);
    seconds = seconds * percent / 100;
    this.track.seekTo(Math.round(seconds * 1000));
  }
}

