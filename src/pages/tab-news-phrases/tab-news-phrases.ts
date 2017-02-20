import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { TextToSpeech } from 'ionic-native';

@Component({
  templateUrl: 'tab-news-phrases.html',
})
export class TabNewsPhrases {
  news: any = {};
  words: any[] = [];

  constructor(private navParams: NavParams, private navCtrl: NavController) {
    this.news = this.navParams.data;
    this.words = this.news.words.map((word) => {
      let phonetic = word.phonetic.trim();
      word.phoneticList = word.otherPhonetic
        .filter((e) => e.trim() !== phonetic).concat(phonetic);
      word.meaningList = word.meaning.map((e) => e.mean);
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

  goBack() {
    this.navCtrl.parent.viewCtrl.dismiss();
  }
}
