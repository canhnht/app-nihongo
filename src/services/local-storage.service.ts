import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class LocalStorageService {

  constructor(private storage: Storage) {
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
    return this.storage.set(key, value);
  }

  get(key) {
    return this.storage.get(key).then(res => {
      return JSON.parse(res);
    })
  }
}
