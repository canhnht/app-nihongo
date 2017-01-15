import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, NavParams } from 'ionic-angular';
import { SpinnerDialog, NativeAudio, TextToSpeech } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import _ from 'lodash';
import { AudioPlayer } from '../../components';

const QUOTES = {
  FIRST_QUESTION: 'Hãy cố gắng trả lời đúng tất cả!',
  CORRECT_QUESTION: 'Rất tốt! Tiếp tục phát huy nào!',
  HALF_WAY: 'Nửa chặng rồi! Cố gắng lên!',
  TIME_OUT: 'Bạn đã bỏ câu. Bạn phải chơi lại từ đầu.',
  WRONG_ANSWER: 'Bạn đã sai. Bạn phải chơi lại từ đầu.'
};

enum QuestionType {
  KanjiToHiragana_Text,
  HiraganaToKanji_Text,
  KanjiToHiragana_Voice,
  HiraganaToKanji_Voice,
};

@Component({
  selector: 'page-playground',
  templateUrl: 'playground.html'
})
export class PlaygroundPage {
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
  listQuestion: any[];
  intervalCountdown: any = null;
  countdownPercent: number;
  progressPercent: number;
  selectedOption: number;
  isCorrect: boolean;
  numberWrongAnswer: number;
  timeout: boolean;
  quote: string;
  currentQuestion: number;
  answerAll: boolean;
  success: boolean;

  onPass: any;
  onFail: any;
  words: any[];
  numberQuestions: number;
  timeLimit: number;

  width: 4;
  height: 5;
  listCell = [
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },

    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },

    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },

    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: false,
      correct: false
    },
    {
      text: 'text',
      flip: true,
      correct: true
    },
    {
      text: 'text',
      flip: true,
      correct: false
    }
  ];

  constructor(private navController: NavController, private navParams: NavParams,
    private translate: TranslateService) {
    this.words = [
      {
        kanji: 'kanji1',
        phonetic: [ 'phonetic1' ]
      },
      {
        kanji: 'kanji2',
        phonetic: [ 'phonetic2' ]
      },
      {
        kanji: 'kanji3',
        phonetic: [ 'phonetic3' ]
      }
    ];
    this.onPass = () => { alert('onPass'); };
    this.onFail = () => { alert('onFail'); };
    this.reset();
  }

  reset() {
    this.listQuestion = this.generateListQuestion();
    this.numberWrongAnswer = 0;
    this.answerAll = false;
    this.success = false;
    this.selectedOption = -1;
    this.timeout = false;
  }

  generateListQuestion() {
    this.words = _.shuffle(this.words);
    this.numberQuestions = Math.min(this.words.length, 10);
    this.timeLimit = 10;
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
      type: questionType
    };
    if (questionType === QuestionType.KanjiToHiragana_Text
      || questionType === QuestionType.KanjiToHiragana_Voice) {
      question.question = word.kanji;
      let otherOptions = this.getOtherOptions(3).map((word) => word.phonetic[0]);
      question.options = [word.phonetic[0], ...otherOptions];
      question.answer = 0;
    } else if (questionType === QuestionType.HiraganaToKanji_Text
      || questionType === QuestionType.HiraganaToKanji_Voice) {
      question.question = word.phonetic[0];
      let otherOptions = this.getOtherOptions(3).map(word => word.kanji);
      question.options = [word.kanji, ...otherOptions];
      question.answer = 0;
    }
    return this.shuffleAnswer(question);
  }

  getOtherOptions(numberOptions) {
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

  shuffleAnswer(question) {
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

  ionViewWillLeave() {
    this.stopQuestion();
    this.onFail();
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
    // TextToSpeech.speak({
    //   text: text,
    //   locale: 'ja-jp'
    // }).then(() => {}).catch(err => {
    //   alert(`tts ${err}`);
    // });
  }

  next() {
    NativeAudio.play('touch', ()=>{});
    if (this.currentQuestion + 1 === this.numberQuestions) {
      this.answerAll = true;
      this.success = this.numberWrongAnswer === 0;
      NativeAudio.play(this.success ? 'success' : 'fail', ()=>{});
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
    this.generateQuote(questionIndex);
    this.progressPercent = (questionIndex + 1) / this.numberQuestions * 100;
    this.selectedOption = -1;
    let interval = 500;
    let timeLimit = this.timeLimit * 1000;
    let countdown = timeLimit;
    this.intervalCountdown = setInterval(() => {
      this.countdownPercent = countdown / timeLimit * 100;
      countdown -= interval;
      if (countdown == 5000)
        NativeAudio.play('count_down_5', ()=>{});
      if (countdown == 0) {
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
    if (!this.isCorrect) {
      NativeAudio.play('incorrect', ()=>{});
      this.numberWrongAnswer++;
    } else {
      NativeAudio.play('correct', ()=>{});
    }
    if (optionIndex == -2) {
      this.timeout = true;
    } else {
      this.timeout = false;
    }
  }

  close() {
    NativeAudio.play('touch', ()=>{});
    this.stopQuestion();
    this.navController.pop();
  }

  generateQuote(questionIndex) {
    if (questionIndex === 0) this.quote = QUOTES.FIRST_QUESTION;
    else if (this.timeout) {
      this.quote = QUOTES.TIME_OUT;
    } else if (this.numberWrongAnswer > 0) {
      this.quote = QUOTES.WRONG_ANSWER;
    } else {
      if (questionIndex === Math.floor(this.numberQuestions / 2)) {
        this.quote = QUOTES.HALF_WAY;
      } else {
        this.quote = QUOTES.CORRECT_QUESTION;
      }
    }
  }

  playAgain() {
    NativeAudio.play('touch', ()=>{});
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
