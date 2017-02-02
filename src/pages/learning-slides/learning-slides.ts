import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ModalController, NavParams } from 'ionic-angular';
import { SpinnerDialog, MediaPlugin, NativeAudio, TextToSpeech } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PlaylistOptions } from '../../components';
import { AudioService, SliderService, DbService } from '../../services';
import { QuestionType } from '../../helpers/custom-types';

declare var cordova: any;

@Component({
  templateUrl: 'learning-slides.html',
})
export class LearningSlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;
  sliderOptions: any = {
    loop: true,
    initialSlide: 1
  };
  default_slides_indexes = [];
  default_slides = [];
  slides: any[];
  head: number;
  tail: number;
  direction: number = 0;
  previousActiveIndex: number = -1;

  words: any[] = [];
  currentIndex: number = 0;
  singleTrack: MediaPlugin = null;
  firstTime: boolean = true;

  intervalUpdateDom: any;

  previousWords: any[] = [];
  showQuestion: boolean = false;
  question: any;

  constructor(private navCtrl: NavController, private audioService: AudioService,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private modalCtrl: ModalController) {
    this.words = this.navParams.data.listWord;

    this.default_slides_indexes = [ this.previousWordIndex(0), 0, this.nextWordIndex(0) ];
    this.default_slides = this.default_slides_indexes.map((e) => this.makeSlide(e));
    this.slides = [...this.default_slides];
    this.head = this.slides[0].nr;
    this.tail = this.slides[this.slides.length - 1].nr;
  }

  previousWordIndex(wordIndex) {
    if (this.words.length === 1) return 0;
    if (wordIndex === 0) return this.words.length - 1;
    return wordIndex - 1;
  }

  nextWordIndex(wordIndex) {
    if (this.words.length === 1) return 0;
    if (wordIndex === this.words.length - 1) return 0;
    return wordIndex + 1;
  }

  getColor(nr) {
    // return nr % 2 === 0 ? '#59a8f2' : '#51b147';
    return '#51b147';
  }

  makeSlide(nr) {
    return {
      nr: nr,
      color: this.getColor(nr)
    };
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
    this.intervalUpdateDom = setInterval(this.updateDuplicateNode, 500);
  }

  ionViewWillLeave() {
    this.singleTrack.release();
    clearInterval(this.intervalUpdateDom);
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  getSlideIndex(activeIndex) {
    if (activeIndex === 1 || activeIndex === 4) return 0;
    if (activeIndex === 3 || activeIndex === 0) return 2;
    return 1;
  }

  onSlideChanged($event) {
    let i = this.getSlideIndex($event.activeIndex);
    if (!this.firstTime) {
      let previousIndex = i === 0 ? 2 : i - 1;
      let nextIndex = i === 2 ? 0 : i + 1;
      let newDirection = $event.activeIndex > this.previousActiveIndex ? 1 : -1;
      this.slides[newDirection > 0 ? nextIndex : previousIndex] = this.createSlideData(newDirection, this.direction);
      this.direction = newDirection;
    } else {
      this.firstTime = false;
    }

    this.currentIndex = this.slides[i].nr;

    if (this.previousWords.length >= this.getRandomThreshold()) {
      let randomWord = this.extractRandomWord(this.previousWords);
      this.question = this.generateQuestion(randomWord, this.previousWords);
      this.previousWords = [];
      this.showQuestion = true;
    } else this.saveToPreviousWords(this.words[this.currentIndex]);

    if (this.singleTrack) {
      this.singleTrack.release();
    }
    this.singleTrack = new MediaPlugin(`${cordova.file.dataDirectory}${this.words[this.currentIndex].audioFile}`);
    if (!this.showQuestion) {
      this.singleTrack.play();
      this.dbService.updateAnalytic(this.words[this.currentIndex]);
    }
  }

  private saveToPreviousWords(word) {
    let searchedIndex = this.previousWords.findIndex((item) => item.id === word.id);
    if (searchedIndex == -1) this.previousWords.push(word);
  }

  private getRandomThreshold() {
    return Math.floor(Math.random() * 3) + 4;
  }

  private extractRandomWord(listWord) {
    let index = Math.floor(Math.random() * listWord.length);
    let word = listWord[index];
    listWord.splice(index, 1);
    return word;
  }

  private generateQuestion(word, previousWords) {
    let types = [
      QuestionType.KanjiToHiragana_Text,
      QuestionType.HiraganaToKanji_Text,
      QuestionType.KanjiToHiragana_Voice,
      QuestionType.HiraganaToKanji_Voice
    ];
    let questionType = types[Math.floor(Math.random() * types.length)];
    let question: any = {
      type: questionType,
      done: false,
      selectedOption: -1,
      correct: false,
      answer: 0
    };
    if (questionType == QuestionType.KanjiToHiragana_Text
      || questionType == QuestionType.KanjiToHiragana_Voice) {
      question.question = word.kanji;
      let otherOptions = previousWords.slice(0, 3).map((word) => word.phonetic[0]);
      question.options = [word.phonetic[0], ...otherOptions];
    } else if (questionType == QuestionType.HiraganaToKanji_Text
      || questionType == QuestionType.HiraganaToKanji_Voice) {
      question.question = word.phonetic[0];
      let otherOptions = previousWords.slice(0, 3).map(word => word.kanji);
      question.options = [word.kanji, ...otherOptions];
    }
    return this.shuffleAnswer(question);
  }

  private shuffleAnswer(question) {
    question = Object.assign({}, question);
    let randomIndex = 1 + Math.floor(Math.random() * 3);
    let temp = question.options[0];
    question.options[0] = question.options[randomIndex];
    question.options[randomIndex] = temp;
    question.answer = randomIndex;
    return question;
  }

  isTextQuestion(question) {
    return question.type == QuestionType.KanjiToHiragana_Text
      || question.type == QuestionType.HiraganaToKanji_Text;
  }

  isVoiceQuestion(question) {
    return question.type == QuestionType.KanjiToHiragana_Voice
      || question.type == QuestionType.HiraganaToKanji_Voice;
  }

  playQuestion(question) {
    let text = '';
    if (question.type == QuestionType.KanjiToHiragana_Voice) {
      text = question.question;
    } else if (question.type == QuestionType.HiraganaToKanji_Voice) {
      text = question.options[question.answer];
    }
    TextToSpeech.speak({
      text: text,
      locale: 'ja-jp'
    }).then(() => {}).catch(err => {
      alert(`tts ${err}`);
    });
  }

  answerQuestion(question, optionIndex) {
    question.selectedOption = optionIndex;
    question.correct = optionIndex === question.answer;
    question.done = true;
    NativeAudio.play(question.correct ? 'correct' : 'incorrect');
  }

  closeQuestion() {
    this.showQuestion = false;
    this.previousWords.push(this.words[this.currentIndex]);
    this.singleTrack.play();
    this.dbService.updateAnalytic(this.words[this.currentIndex]);
  }

  createSlideData(newDirection, oldDirection) {
    if (newDirection === 1) {
      this.tail = oldDirection < 0 ? this.head + 3 : this.tail + 1;
    } else {
      this.head = oldDirection > 0 ? this.tail - 3 : this.head - 1;
    }
    this.head = (this.head + this.words.length * 3) % this.words.length;
    this.tail = (this.tail + this.words.length * 3) % this.words.length;
    let nr = newDirection === 1 ? this.tail : this.head;
    if (this.default_slides_indexes.indexOf(nr) !== -1) {
      return this.default_slides[this.default_slides_indexes.indexOf(nr)];
    }
    return this.makeSlide(nr);
  }

  updateDuplicateNode() {
    let dupStartNodes = document.querySelectorAll(".slide-content-0");
    let dupEndNodes = document.querySelectorAll(".slide-content-2");
    if (dupStartNodes.length !== 2 || dupEndNodes.length !== 2) return;
    let dupStartNode = <HTMLElement>dupStartNodes.item(1);
    let startNode = <HTMLElement>dupStartNodes.item(0);
    dupStartNode.innerHTML = startNode.innerHTML;
    dupStartNode.style.backgroundColor = startNode.style.backgroundColor;

    let dupEndNode = <HTMLElement>dupEndNodes.item(0);
    let endNode = <HTMLElement>dupEndNodes.item(1);
    dupEndNode.innerHTML = endNode.innerHTML;
    dupEndNode.style.backgroundColor = endNode.style.backgroundColor;
  }

  repeatCurrentVocabulary($event) {
    $event.stopPropagation();
    this.singleTrack.pause();
    this.singleTrack.seekTo(0);
    this.singleTrack.play();
  }

  addToPlaylist($event) {
    $event.stopPropagation();
    let word = this.words[this.currentIndex];
    let modal = this.modalCtrl.create(PlaylistOptions, { currentWord: word });
    modal.onDidDismiss((res) => {
      if (!res) return;
      let { diffPlaylists, isBookmarked } = res;
      word.bookmarked = isBookmarked;
      this.dbService.updateWordPlaylist(word.id, diffPlaylists);
    });
    modal.present();
  }

  closeSlide() {
    this.navCtrl.pop();
  }
}
