import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LocalStorageService } from '../../services';

@Component({
  templateUrl: 'setting-word.html'
})
export class SettingWord {
  modeDisplay: any;
  timeBetweenWords: number;
  repeatEachWord: number;

  constructor(public navCtrl: NavController, private storageService: LocalStorageService) {
   this.modeDisplay = "kanji";
   this.storageService.get('time_between_words').then((res) => this.timeBetweenWords = res);
   this.storageService.get('repeat_each_word').then((res) => this.repeatEachWord = res);
  }

  setTimeBetweenWords() {
    this.storageService.set('time_between_words', this.timeBetweenWords);
  }

  setRepeatEachWord() {
    this.storageService.set('repeat_each_word', this.repeatEachWord);
  }
}
