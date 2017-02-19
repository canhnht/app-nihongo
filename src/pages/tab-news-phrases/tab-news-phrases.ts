import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { TextToSpeech } from 'ionic-native';

@Component({
  templateUrl: 'tab-news-phrases.html',
})
export class TabNewsPhrases {
  news: any = {};
  words: any[] = [];

  constructor(private navParams: NavParams) {
    this.news = this.navParams.data;
    this.words = this.news.words.map((word) => {
      let phonetic = word.phonetic.trim();
      word.phonetic = word.otherPhonetic
        .filter((e) => e.trim() !== phonetic).concat(phonetic);
      delete word.otherPhonetic;
      word.meaning = word.meaning.map((e) => e.mean);
      return word;
    });
  }

  playWord($event, word) {
    $event.stopPropagation();
    TextToSpeech.speak({
      text: word.kanji,
      locale: 'ja-jp'
    }).then(() => {}).catch(err => {
      alert(`tts ${err}`);
    });
  }
}
