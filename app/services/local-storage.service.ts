import {Injectable} from '@angular/core';
import * as utils from '../utils';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class LocalStorageService {
  local: Storage;

  constructor() {
    this.local = new Storage(LocalStorage);
  }

  init() {
    return this.get('init').then(res => {
      if (!res) {
        return this.set('init', true)
          .then(this.set.bind(this, 'language', 'vi'))
          .then(this.set.bind(this, 'time_between_words', 0))
          .then(this.set.bind(this, 'repeat_each_word', 1));
      }
    });
  }

  set(key, value) {
    value = JSON.stringify(value);
    return this.local.set(key, value);
  }

  get(key) {
    return this.local.get(key).then(res => {
      return JSON.parse(res);
    })
  }
}
