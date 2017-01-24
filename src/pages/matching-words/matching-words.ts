import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SpinnerDialog, NativeAudio } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import _ from 'lodash';

@Component({
  templateUrl: 'matching-words.html',
})
export class MatchingWords {
  listCell: any[] = [];
  intervalCountdown: any = null;
  countdown: number;
  countdownPercent: number;
  progressPercent: number = 0;
  numberCorrect: number = 0;
  playing: boolean = true;
  selectedWordIndex: number = -1;
  prevCellIndex: number = -1;
  processing: boolean = false;
  endQuiz: boolean;
  success: boolean;

  onPass: any;
  onFail: any;
  words: any[];
  numberQuestions: number;
  timeLimit: number;

  constructor(private navController: NavController, private translate: TranslateService,
    private navParams: NavParams) {
    this.words = this.navParams.data.words.filter((word) => {
      if (word.phonetic.length == 0) return false;
      if (word.phonetic.length == 1 && word.phonetic[0] === word.kanji) return false;
      return true;
    });
    this.onPass = this.navParams.data.onPass;
    this.onFail = this.navParams.data.onFail;
    this.reset(true);
  }

  reset(newQuestions = false) {
    this.timeLimit = 300000;
    this.countdown = this.timeLimit;
    this.numberQuestions = 10;
    this.progressPercent = 0;
    this.numberCorrect = 0;
    this.endQuiz = false;
    this.success = false;
    if (newQuestions)
      this.listCell = this.generateListCell(_.shuffle(this.words).slice(0, this.numberQuestions));
    else
      this.listCell = _.shuffle(this.listCell).map((cell) => Object.assign({}, cell, {
        flip: false,
        correct: false
      }));
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
    this.start();
  }

  ionViewWillLeave() {
    this.stop();
    if (this.endQuiz && this.success) this.onPass();
    else this.onFail();
  }

  generateListCell(words) {
    let cells = [];
    words.forEach((word, ind) => {
      cells.push({
        text: word.kanji,
        wordIndex: ind,
        flip: false,
        correct: false
      });
      cells.push({
        text: word.phonetic[0],
        wordIndex: ind,
        flip: false,
        correct: false
      });
    });
    return _.shuffle(cells);
  }

  close() {
    NativeAudio.play('touch');
    this.navController.pop();
  }

  start() {
    let interval = 500;
    this.intervalCountdown = setInterval(() => {
      this.countdownPercent = this.countdown / this.timeLimit * 100;
      this.countdown -= interval;
      if (this.countdown == 0) {
        this.countdownPercent = 0;
        this.stop();
        if (this.numberCorrect < this.numberQuestions) {
          NativeAudio.play('fail');
          this.endQuiz = true;
          this.success = false;
        }
      }
    }, interval);
  }

  stop() {
    if (this.intervalCountdown != null) {
      clearInterval(this.intervalCountdown);
      this.intervalCountdown = null;
    }
  }

  pause() {
    NativeAudio.play('touch');
    this.playing = false;
    this.stop();
  }

  play() {
    NativeAudio.play('touch');
    this.playing = true;
    this.start();
  }

  selectCell(cellIndex) {
    let cell = this.listCell[cellIndex];
    if (cell.correct || cell.flip) return;
    if (this.processing) return;
    NativeAudio.play('touch');
    cell.flip = true;
    if (this.selectedWordIndex == -1) {
      this.selectedWordIndex = cell.wordIndex;
      this.prevCellIndex = cellIndex;
    } else {
      this.processing = true;
      setTimeout(() => {
        this.processing = false;
        if (this.selectedWordIndex == cell.wordIndex) {
          NativeAudio.play('correct');
          this.listCell[this.prevCellIndex].correct = true;
          this.listCell[cellIndex].correct = true;
          this.numberCorrect += 1;
          this.progressPercent = this.numberCorrect / this.numberQuestions * 100;
          if (this.numberCorrect == this.numberQuestions) {
            NativeAudio.play('success');
            this.stop();
            this.endQuiz = true;
            this.success = true;
          }
        } else {
          NativeAudio.play('incorrect');
          this.listCell[this.prevCellIndex].flip = false;
          this.listCell[cellIndex].flip = false;
        }
        this.prevCellIndex = -1;
        this.selectedWordIndex = -1;
      }, 1000);
    }
  }

  testAgain() {
    NativeAudio.play('touch');
    this.reset();
    this.start();
  }
}
