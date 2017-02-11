import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { LocalStorageService } from '../../services';

@Component({
  templateUrl: 'setting-word.html'
})
export class SettingWord {
  displayMode: string;
  timeBetweenWords: number;
  repeatEachWord: number;

  constructor(public viewCtrl: ViewController, private storageService: LocalStorageService) {
   this.storageService.get('time_between_words').then((res) => this.timeBetweenWords = res);
   this.storageService.get('repeat_each_word').then((res) => this.repeatEachWord = res);
   this.storageService.get('display_mode').then((res) => this.displayMode = res);
  }

  setTimeBetweenWords() {
    this.storageService.set('time_between_words', this.timeBetweenWords);
  }

  setRepeatEachWord() {
    this.storageService.set('repeat_each_word', this.repeatEachWord);
  }

  setDisplayMode() {
    this.storageService.set('display_mode', this.displayMode);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
