import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';

declare var cordova: any;

@Component({
  templateUrl: 'sentence-page.html',
})
export class SentencePage {
  word: any = {
    kanji: '給料',
    mainExample: {
      content: '会社から給料をもらう。',
      meaning: 'Nhận lương từ công ty'
    },
    meaning: [
      {
        mean: 'bổng lộc'
      },
      {
        mean: 'lương bổng'
      },
      {
        mean: 'tiền lương; lương'
      }
    ],
    phonetic: [
      'きゅうりょう'
    ],
    otherExamples: [
      {
        content: '会社から給料をもらう。',
        meaning: 'Nhận lương từ công ty'
      },
      {
        content: '会社から給料をもらう。',
        meaning: 'Nhận lương từ công ty'
      },
      {
        content: '会社から給料をもらう。',
        meaning: 'Nhận lương từ công ty'
      }
    ]
  };
  sentence: any = {
    content: '会社から給料をもらう。',
    meaning: 'Nhận lương từ công ty'
  };
  displaySentence: string[];
  track: MediaPlugin = null;

  constructor(private navParams: NavParams) {
    this.word = this.navParams.data.word;
    this.sentence = this.navParams.data.sentence;
    let kanjiIndex = this.sentence.content.indexOf(this.word.kanji);
    this.displaySentence = [
      this.sentence.content.substring(0, kanjiIndex),
      this.sentence.content.substring(kanjiIndex, kanjiIndex + this.word.kanji.length),
      this.sentence.content.substring(kanjiIndex + this.word.kanji.length)
    ];
  }

  ionViewWillLeave() {
    if (this.track) {
      this.track.release();
      this.track = null;
    }
  }

  playWord() {
    if (this.track) this.track.stop();
    else this.track = new MediaPlugin(`${cordova.file.dataDirectory}${this.word.audioFile}`);
    this.track.play();
  }
}
