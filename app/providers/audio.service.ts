import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin, Toast} from 'ionic-native';

@Injectable()
export class AudioService {
  currentTrackSubject: Subject<any> = new Subject<any>();
  currentTrack: any = {};
  intervalGetCurrentPosition: any;
  track: MediaPlugin;

  constructor(http: Http) {
    this.currentTrack.playedTime = '0:0';
  }

  convertText(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes}:${seconds}`;
  }

  playCourse(course) {
    console.log('zuizui:playCourse', course);
    this.currentTrack.title = 'Course 1 - Unit 1 - Word A';
    this.currentTrack.playedPercent = 10;
  }

  playUnit(unit) {
    console.log('zuizui:playUnit', unit);
    this.currentTrack.title = 'Course 2 - Unit 3 - Word B';
    this.currentTrack.playedPercent = 60;
  }

  playVocabulary(vocabulary) {
    console.log('zuizui:playVocabulary', vocabulary);
    this.currentTrack.title = 'Course 1 - Unit 2 - Word C';
    this.currentTrack.playedPercent = 90;
  }

  play() {
    this.track = new MediaPlugin('/android_asset/www/audio/audio1.mp3');
    this.currentTrack.isPlaying = true;
    this.track.play();
    this.startGetCurrentPositionInterval();
  }

  startGetCurrentPositionInterval() {
    this.intervalGetCurrentPosition = setInterval(() => {
      let duration = this.track.getDuration();
      this.currentTrack.duration = this.convertText(Math.max(duration, 0));
      this.track.getCurrentPosition().then((position) => {
        if (position >= 0 && duration >= 0) {
          this.currentTrack.playedPercent = Math.round(position / duration * 100);
          this.currentTrack.playedTime = this.convertText(Math.max(position, 0));
        }
      });
    }, 1000);
  }

  stopGetCurrentPositionInterval() {
    clearInterval(this.intervalGetCurrentPosition);
  }

  pause() {
    this.currentTrack.isPlaying = false;
    this.track.pause();
    this.stopGetCurrentPositionInterval();
  }

  seek(percent) {
    let seconds = Math.max(this.track.getDuration(), 0);
    seconds = seconds * percent / 100;
    this.track.seekTo(Math.round(seconds * 1000));
  }
}

