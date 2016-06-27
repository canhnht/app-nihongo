import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';
import {MediaPlugin} from 'ionic-native';
import {Platform} from 'ionic-angular';

/*
  Generated class for the AudioService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AudioService {
  currentTrack: Subject<any> = new Subject<any>();
  track: MediaPlugin;

  constructor(public http: Http, private platform: Platform) {
    platform.ready().then(() => {
      this.track = new MediaPlugin('/android_asset/www/audio/audio 1.mp3');
      setInterval(() => {
        let duration = this.track.getDuration();
        console.log('shit:interval:23 ' + duration);
        this.track.getCurrentPosition().then((position) => {
          if (position >= 0 && duration >= 0) {
            // this.data.playedPercent = Math.round(position / duration * 100);
          }
          // console.log('shit:position:25 ' + position + ' ' + this.data.playedPercent);
        });
      }, 1000);
    })
    console.log('shit:audio:31 not ready');
  }

  playCourse(course) {
    console.log('playCourse', course);
    this.currentTrack.next({
      title: 'Course 1 - Unit 1 - Word A',
    });
  }

  playUnit(unit) {
    console.log('playUnit', unit);
    this.currentTrack.next({
      title: 'Course 2 - Unit 3 - Word B',
    });
  }

  playVocabulary(vocabulary) {
    console.log('playVocabulary', vocabulary);
    this.currentTrack.next({
      title: 'Course 1 - Unit 2 - Word C',
    });
  }

  play() {
    this.track.play();
  }

  pause() {
    this.track.pause();
  }
}

