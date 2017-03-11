import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';
import * as utils from '../../helpers/utils';

declare var cordova: any;

@Component({
  templateUrl: 'sentence-page.html',
})
export class SentencePage {
  word: any = {};
  sentence: any = {};
  displaySentence: string[];
  track: MediaPlugin = null;

  constructor(private navParams: NavParams) {
    this.word = this.navParams.data.word;
    this.word.meaningList = this.word.meaning.map((e) => e.mean);
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
    if (this.track) {
      this.track.stop();
      this.track.play();
    } else
      utils.resolveIntervalUrl(`${cordova.file.dataDirectory}${this.word.audioFolder}`, this.word.audioFile)
        .then((url) => {
          this.track = new MediaPlugin(url);
          this.track.play();
        });
  }
}
