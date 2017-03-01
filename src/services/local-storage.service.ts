import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

export type LocalConfig = 'language'
                        | 'time_between_words'
                        | 'repeat_each_word'
                        | 'user'
                        | 'init'
                        | 'init_db'
                        | 'display_mode';

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
          .then(this.set.bind(this, 'repeat_each_word', 1))
          .then(this.set.bind(this, 'display_mode', 'hiragana,meaning'));
      }
    });
  }

  set(key: LocalConfig, value) {
    return this.storage.set(key, value);
  }

  get(key: LocalConfig) {
    return this.storage.get(key);
  }

  remove(key: LocalConfig) {
    return this.storage.remove(key);
  }
}
