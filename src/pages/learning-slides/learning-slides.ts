import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ModalController, NavParams } from 'ionic-angular';
import { SpinnerDialog, MediaPlugin, TextToSpeech, NativeAudio } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PlaylistOptions } from '../../components';
import { AudioService, SliderService, DbService } from '../../services';
import { SlideType, QuestionType } from '../../helpers/custom-types';

declare var cordova: any;

@Component({
  templateUrl: 'learning-slides.html',
})
export class LearningSlides {
  @ViewChild('learningSlider') learningSlider: Slides;
  sliderOptions = {
    loop: false
  };

  words: any[] = [];
  slides: any[] = [];
  slideProgress: number = 0;
  currentTrack: MediaPlugin = null;
  currentIndex: number;

  constructor(private navCtrl: NavController,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private modalCtrl: ModalController) {
    this.words = this.navParams.data.listWord;
    this.slides = this.generateSlides(this.words);
    this.currentIndex = 0;
    this.updateSlides();
  }

  private generateSlides(words) {
    let previousWords = [];
    return words.map((word) => {
      previousWords.push(word);
      let data = [ this.generateWordSlide(word) ];
      if (previousWords.length >= this.getRandomThreshold()) {
        let randomWord = this.extractRandomWord(previousWords);
        data.push(this.generateQuestionSlide(randomWord, previousWords));
        previousWords = [];
      }
      return data;
    }).reduce((res, item) => res.concat(item), []);
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

  private generateWordSlide(word) {
    let slide = word;
    slide.type = SlideType.Word;
    return slide;
  }

  private generateQuestionSlide(word, previousWords) {
    let types = [
      QuestionType.KanjiToHiragana_Text,
      QuestionType.HiraganaToKanji_Text,
      QuestionType.KanjiToHiragana_Voice,
      QuestionType.HiraganaToKanji_Voice
    ];
    let questionType = types[Math.floor(Math.random() * types.length)];
    let slide: any = {
      type: SlideType.MultipleChoiceQuestion,
      questionType,
      done: false,
      selectedOption: -1,
      correct: false
    };
    if (questionType == QuestionType.KanjiToHiragana_Text
      || questionType == QuestionType.KanjiToHiragana_Voice) {
      slide.question = word.kanji;
      let otherOptions = previousWords.slice(0, 3).map((word) => word.phonetic[0]);
      slide.options = [word.phonetic[0], ...otherOptions];
      slide.answer = 0;
    } else if (questionType == QuestionType.HiraganaToKanji_Text
      || questionType == QuestionType.HiraganaToKanji_Voice) {
      slide.question = word.phonetic[0];
      let otherOptions = previousWords.slice(0, 3).map(word => word.kanji);
      slide.options = [word.kanji, ...otherOptions];
      slide.answer = 0;
    }
    return this.shuffleAnswer(slide);
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

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  isWordSlide(slide) {
    return slide.type == SlideType.Word;
  }

  isQuestionSlide(slide) {
    return slide.type == SlideType.MultipleChoiceQuestion;
  }

  isTextQuestion(question) {
    return question.questionType == QuestionType.KanjiToHiragana_Text
      || question.questionType == QuestionType.HiraganaToKanji_Text;
  }

  isVoiceQuestion(question) {
    return question.questionType == QuestionType.KanjiToHiragana_Voice
      || question.questionType == QuestionType.HiraganaToKanji_Voice;
  }

  playQuestion(question) {
    let text = '';
    if (question.questionType == QuestionType.KanjiToHiragana_Voice) {
      text = question.question;
    } else if (question.questionType == QuestionType.HiraganaToKanji_Voice) {
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
  }

  prev() {
    this.learningSlider.slidePrev();
  }

  next() {
    this.learningSlider.slideNext();
  }

  onSlideChanged($event) {
    this.currentIndex = $event.activeIndex;
    this.updateSlides();
  }

  private updateSlides() {
    this.slideProgress = (this.currentIndex + 1) / this.slides.length * 100;
    let currentSlide = this.slides[this.currentIndex];
    if (this.currentTrack)
      this.currentTrack.release();
    if (this.isWordSlide(currentSlide)) {
      this.currentTrack = new MediaPlugin(`${cordova.file.dataDirectory}${currentSlide.audioFile}`);
      this.currentTrack.play();
      this.dbService.updateAnalytic(currentSlide);
    }
  }

  repeatCurrentVocabulary($event) {
    $event.stopPropagation();
    this.currentTrack.seekTo(0);
    this.currentTrack.play();
  }

  addToPlaylist($event) {
    $event.stopPropagation();
    let word = this.slides[this.currentIndex];
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
