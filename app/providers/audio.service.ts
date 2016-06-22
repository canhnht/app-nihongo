import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

/*
  Generated class for the AudioService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AudioService {
  data: any = {};


  constructor(public http: Http) {
  }

  playCourse(course) {
    console.log('playCourse', course);
    this.data.currentTrack = 'Course 1 - Unit 1 - Word A';
  }

  playUnit(unit) {
    console.log('playUnit', unit);
    this.data.currentTrack = 'Course 2 - Unit 3 - Word B';
  }

  playVocabulary(vocabulary) {
    console.log('playVocabulary', vocabulary);
    this.data.currentTrack = 'Course 1 - Unit 2 - Word C';
  }

  getCurrentTrack() {
    return this.data;
  }
}

