import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog, NativeAudio} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/explore-japan-round/explore-japan-round.html',
})
export class ExploreJapanRound {
  data: any = {};
  topic: string;
  roundNumber: number;
  listWord: any[] = [];
  listCell: any[] = [];
  numberCells: number;
  width: number = 1;
  height: number = 1;
  intervalCountdown: any = null;
  countdown: number;
  timeLimit: number;
  countdownPercent: number;
  progressPercent: number = 0;
  numberCorrect: number = 0;
  playing: boolean = true;
  selectedWordIndex: number = -1;
  prevCellIndex: number = -1;
  displayResult: boolean = false;
  iter = [
    [],
    [0],
    [0,0],
    [0,0,0]
  ];
  numberStars: number = 0;
  iconUrl: string;
  iconActiveUrl: string;
  processing: boolean = false;

  constructor(private navController: NavController, private translate: TranslateService,
    private dbService: DbService, private navParams: NavParams) {
    let {topic, roundNumber} = this.navParams.data;
    this.topic = topic;
    this.roundNumber = roundNumber;
    this.resetGame(topic, roundNumber);
  }

  resetGame(topic, roundNumber) {
    this.processing = false;
    this.displayResult = false;
    this.timeLimit = this.getTimeLimit(roundNumber) * 1000;
    this.countdown = this.timeLimit;
    this.numberCells = this.getNumberCells(roundNumber);
    this.progressPercent = 0;
    this.numberCorrect = 0;
    this.dbService.getExploreJapanData().then(data => {
      this.data = data;
      this.listWord = this.generateListWord(this.data[topic]);
      this.listCell = this.generateListCell(topic, this.listWord);
    });
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
    this.startGame();
  }

  ionViewWillLeave() {
    this.stopGame();
  }

  generateListWord(words) {
    words = this.shuffleArray(words);
    let numberWords = this.numberCells / 2;
    return words.slice(0, numberWords);
  }

  generateListCell(topic, words) {
    let cells = [];
    words.forEach((item, ind) => {
      cells.push({
        text: item.word,
        wordIndex: ind,
        flip: false,
        correct: false
      });
      cells.push({
        imageUrl: `images/${topic}/${item.imageFile}`,
        wordIndex: ind,
        flip: false,
        correct: false
      });
    });
    return this.shuffleArray(cells);
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i >= 0; --i) {
      let k = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[k];
      arr[k] = temp;
    }
    return arr;
  }

  close() {
    NativeAudio.play('touch', ()=>{});
    this.navController.pop();
  }

  startGame() {
    let interval = 500;
    this.intervalCountdown = setInterval(() => {
      this.countdownPercent = this.countdown / this.timeLimit * 100;
      this.countdown -= interval;
      if (this.countdown == 5000)
        NativeAudio.play('count_down_5', ()=>{});
      if (this.countdown == 0) {
        this.stopGame();
        if (this.numberCorrect < this.numberCells / 2) {
          NativeAudio.play('fail', ()=>{});
          this.updateResult(false);
          this.displayResult = true;
        }
      }
    }, interval);
  }

  stopGame() {
    if (this.intervalCountdown != null) {
      NativeAudio.stop('count_down_5');
      clearInterval(this.intervalCountdown);
      this.intervalCountdown = null;
    }
  }

  getTimeLimit(roundNumber) {
    let numberWords = this.getNumberCells(roundNumber) / 2;
    let timeLimitPerWord = 0;
    if (roundNumber <= 2) timeLimitPerWord = 30;
    else if (roundNumber <= 4) timeLimitPerWord = 25;
    else if (roundNumber <= 6) timeLimitPerWord = 20;
    else if (roundNumber <= 8) timeLimitPerWord = 15;
    else timeLimitPerWord = 15;
    return timeLimitPerWord * numberWords;
  }

  getNumberCells(roundNumber) {
    if (roundNumber <= 4) {
      this.width = 3;
      this.height = 4;
      return 12;
    } else {
      this.width = 4;
      this.height = 5;
      return 20;
    }
  }

  pause() {
    NativeAudio.play('touch', ()=>{});
    this.playing = false;
    this.stopGame();
  }

  play() {
    NativeAudio.play('touch', ()=>{});
    this.playing = true;
    this.startGame();
  }

  selectCell(cellIndex) {
    let cell = this.listCell[cellIndex];
    if (cell.correct || cell.flip) return;
    if (this.processing) return;
    NativeAudio.play('touch', ()=>{});
    cell.flip = true;
    if (this.selectedWordIndex == -1) {
      this.selectedWordIndex = cell.wordIndex;
      this.prevCellIndex = cellIndex;
    } else {
      this.processing = true;
      setTimeout(() => {
        this.processing = false;
        if (this.selectedWordIndex == cell.wordIndex) {
          NativeAudio.play('correct', ()=>{});
          this.listCell[this.prevCellIndex].correct = true;
          this.listCell[cellIndex].correct = true;
          this.numberCorrect += 1;
          this.progressPercent = this.numberCorrect / (this.numberCells / 2) * 100;
          if (this.numberCorrect == this.numberCells / 2) {
            NativeAudio.play('success', ()=>{});
            this.stopGame();
            this.updateResult(true);
            this.displayResult = true;
          }
        } else {
          NativeAudio.play('incorrect', ()=>{});
          this.listCell[this.prevCellIndex].flip = false;
          this.listCell[cellIndex].flip = false;
        }
        this.prevCellIndex = -1;
        this.selectedWordIndex = -1;
      }, 1000);
    }
  }

  updateResult(success) {
    this.numberStars = this.calculateStars(success);
    this.dbService.getGameExploreJapan().then(gameData => {
      gameData.stars -= gameData[this.topic][this.roundNumber - 1];
      gameData[this.topic][this.roundNumber - 1] = this.numberStars;
      gameData.stars += this.numberStars;
      this.dbService.updateGameExploreJapan(gameData);
    });
    if (this.topic == 'sushi') {
      this.iconUrl = 'images/sushi-icon.png';
      this.iconActiveUrl = 'images/sushi-icon-active.png';
    } else if (this.topic == 'sadou') {
      this.iconUrl = 'images/tea-icon.png';
      this.iconActiveUrl = 'images/tea-icon-active.png';
    } else if (this.topic == 'ikebana') {
      this.iconUrl = 'images/flower-icon.png';
      this.iconActiveUrl = 'images/flower-icon-active.png';
    }
  }

  calculateStars(success) {
    if (success) return 3;
    else if (this.numberCorrect > 0) return 2;
    else return 0;
  }

  playAgain() {
    NativeAudio.play('touch', ()=>{});
    this.resetGame(this.topic, this.roundNumber);
    this.startGame();
  }
}
