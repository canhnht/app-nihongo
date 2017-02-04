import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, NavParams } from 'ionic-angular';
import { NativeAudio, TextToSpeech } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import _ from 'lodash';
import { QuestionType } from '../../helpers/custom-types';
import { LoaderService } from '../../services';

@Component({
  templateUrl: 'multiple-choice-slides.html'
})
export class MultipleChoiceSlides {
  @ViewChild('questionSlider') questionSlider: Slides;
  slides: any = null;

  sliderOptions: any = {
    loop: true,
    onInit: (slides) => {
      this.slides = slides;
      slides.lockSwipeToPrev();
      slides.lockSwipeToNext();
    }
  };
  listQuestion: any[] = [];
  intervalCountdown: any = null;
  countdownPercent: number;
  progressPercent: number;
  selectedOption: number;
  isCorrect: boolean;
  numberWrongAnswer: number;
  timeout: boolean;
  currentQuestion: number;
  answerAll: boolean;
  success: boolean;

  onPass: any;
  onFail: any;
  words: any[];
  numberQuestions: number;
  timeLimit: number;

  constructor(private navController: NavController, private navParams: NavParams,
    private translate: TranslateService, private loader: LoaderService) {
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
    if (newQuestions)
      this.listQuestion = this.generateListQuestion();
    else {
      this.listQuestion = _.shuffle(this.listQuestion)
        .map((question) => this.shuffleAnswer(question));
    }
    this.numberWrongAnswer = 0;
    this.answerAll = false;
    this.success = false;
    this.selectedOption = -1;
    this.timeout = false;
  }

  generateListQuestion() {
    this.words = _.shuffle(this.words);
    this.numberQuestions = 10;
    this.timeLimit = 10000;
    let types = [
      QuestionType.KanjiToHiragana_Text,
      QuestionType.HiraganaToKanji_Text,
      QuestionType.KanjiToHiragana_Voice,
      QuestionType.HiraganaToKanji_Voice
    ];
    return this.words.slice(0, this.numberQuestions).map((word) => {
      let questionType = types[Math.floor(Math.random() * types.length)];
      return this.generateQuestion(word, questionType);
    });
  }

  generateQuestion(word, questionType) {
    let question: any = {
      type: questionType,
      done: false
    };
    if (questionType == QuestionType.KanjiToHiragana_Text
      || questionType == QuestionType.KanjiToHiragana_Voice) {
      question.question = word.kanji;
      let otherOptions = this.getOtherOptions(3).map((word) => word.phonetic[0]);
      question.options = [word.phonetic[0], ...otherOptions];
      question.answer = 0;
    } else if (questionType == QuestionType.HiraganaToKanji_Text
      || questionType == QuestionType.HiraganaToKanji_Voice) {
      question.question = word.phonetic[0];
      let otherOptions = this.getOtherOptions(3).map(word => word.kanji);
      question.options = [word.kanji, ...otherOptions];
      question.answer = 0;
    }
    return this.shuffleAnswer(question);
  }

  private getOtherOptions(numberOptions) {
    let startIndex = this.numberQuestions;
    let endIndex = this.words.length;
    for (let index = startIndex; index < endIndex; ++index) {
      let randomIndex = index + Math.floor(Math.random() * (endIndex - index));
      let temp = this.words[index];
      this.words[index] = this.words[randomIndex];
      this.words[randomIndex] = temp;
    }
    return this.words.slice(startIndex, startIndex + numberOptions);
  }

  private shuffleAnswer(question) {
    if (question.answer != 0) {
      let temp = question.options[0];
      question.options[0] = question.options[question.answer];
      question.options[question.answer] = temp;
      question.answer = 0;
    }
    question = Object.assign({}, question);
    let randomIndex = 1 + Math.floor(Math.random() * 3);
    let temp = question.options[0];
    question.options[0] = question.options[randomIndex];
    question.options[randomIndex] = temp;
    question.answer = randomIndex;
    return question;
  }

  ionViewDidEnter() {
    this.loader.hide();
  }

  ionViewWillLeave() {
    this.stopQuestion();
    if (this.answerAll && this.success) this.onPass();
    else this.onFail();
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

  next() {
    NativeAudio.play('touch');
    if (this.currentQuestion + 1 === this.numberQuestions) {
      this.answerAll = true;
      this.success = this.numberWrongAnswer === 0;
      NativeAudio.play(this.success ? 'success' : 'fail');
    } else {
      this.slides.unlockSwipeToNext();
      this.questionSlider.slideNext();
      this.slides.lockSwipeToNext();
    }
  }

  onSlideChanged($event) {
    let questionIndex = $event.activeIndex - 1;
    if ($event.activeIndex === this.numberQuestions + 1)
      questionIndex = 0;
    this.startQuestion(questionIndex);
  }

  startQuestion(questionIndex) {
    this.currentQuestion = questionIndex;
    this.progressPercent = (questionIndex + 1) / this.numberQuestions * 100;
    this.selectedOption = -1;
    let interval = 500;
    let countdown = this.timeLimit;
    this.intervalCountdown = setInterval(() => {
      this.countdownPercent = countdown / this.timeLimit * 100;
      countdown -= interval;
      if (countdown == 5000)
        NativeAudio.play('count_down_5');
      else if (countdown == 0) {
        this.countdownPercent = 0;
        this.select(this.listQuestion[questionIndex], -2);
      }
    }, interval);
    if (this.isVoiceQuestion(this.listQuestion[questionIndex])) {
      this.playQuestion(this.listQuestion[questionIndex]);
    }
  }

  stopQuestion() {
    if (this.intervalCountdown != null) {
      NativeAudio.stop('count_down_5');
      clearInterval(this.intervalCountdown);
      this.intervalCountdown = null;
    }
  }

  select(question, optionIndex) {
    this.stopQuestion();
    this.selectedOption = optionIndex;
    this.isCorrect = this.selectedOption === question.answer;
    question.done = true;
    if (!this.isCorrect) {
      NativeAudio.play('incorrect');
      this.numberWrongAnswer++;
    } else {
      NativeAudio.play('correct');
    }
    if (optionIndex == -2) {
      this.timeout = true;
    } else {
      this.timeout = false;
    }
  }

  close() {
    NativeAudio.play('touch');
    this.navController.pop();
  }

  testAgain() {
    NativeAudio.play('touch');
    this.reset();
    this.slideToBeginning();
  }

  slideToBeginning() {
    this.slides.unlockSwipeToNext();
    this.slides.unlockSwipeToPrev();
    this.questionSlider.slideTo(1);
    this.slides.lockSwipeToNext();
    this.slides.lockSwipeToPrev();
  }
}
