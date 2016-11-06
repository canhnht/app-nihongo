import {Component, ViewChild} from '@angular/core';
import {NavController, Slides, Alert, NavParams} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog, NativeAudio, TextToSpeech} from 'ionic-native';
import {Subscription} from 'rxjs';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {GameMultipleChoiceService, QuestionType} from '../../services/game-multiple-choice.service';

const QUOTES = {
  FIRST_QUESTION: 'Hãy cố gắng trả lời đúng tất cả!',
  CORRECT_QUESTION: 'Rất tốt! Tiếp tục phát huy nào!',
  HALF_WAY: 'Nửa chặng rồi! Cố gắng lên!',
  SKIP_QUESTION: 'Bạn đã bỏ câu. Bạn phải chơi lại từ đầu.',
  WRONG_ANSWER: 'Bạn đã sai. Bạn phải chơi lại từ đầu.'
};
@Component({
  templateUrl: 'build/pages/multiple-choice-slides/multiple-choice-slides.html'
})
export class MultipleChoiceSlides {
  @ViewChild('questionSlider') questionSlider: Slides;
  dataSubscription: Subscription;
  slides: any = null;

  sliderOptions: any = {
    loop: true,
    onInit: (slides) => {
      this.slides = slides;
      slides.lockSwipeToPrev();
      slides.lockSwipeToNext();
    }
  };
  data: any = {};
  currentLevel: number;
  numberPlay: number;
  listQuestion: any[];
  intervalCountdown: any = null;
  countdownPercent: number;
  progressPercent: number;
  selectedOption: number;
  isCorrect: boolean;
  numberWrongAnswer: number;
  quote: string;
  currentQuestion: number;
  answerAll: boolean;
  success: boolean;

  constructor(private navController: NavController, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private gameService: GameMultipleChoiceService) {
    this.resetGame();
    this.dbService.getGameMultipleChoice().then(data => this.data = data);
  }

  resetGame(resetQuestion = true) {
    if (resetQuestion)
      this.listQuestion = [...this.gameService.listQuestion];
    this.numberWrongAnswer = 0;
    this.answerAll = false;
    this.success = false;
    this.selectedOption = -1;
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  ionViewWillEnter() {
    this.dataSubscription = this.dbService.gameMultipleChoiceSubject.subscribe(
      data => this.data = data
    );
  }

  ionViewWillLeave() {
    this.dataSubscription.unsubscribe();
    this.stopQuestion();
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
    NativeAudio.play('touch', ()=>{});
    if (this.currentQuestion + 1 == this.gameService.numberQuestions) {
      this.currentLevel = this.data.currentLevel;
      this.numberPlay = this.data.numberPlay + 1;
      this.answerAll = true;
      this.success = this.numberWrongAnswer == 0;
      this.updateDatabase();
    } else {
      this.slides.unlockSwipeToNext();
      this.questionSlider.slideNext();
      this.slides.lockSwipeToNext();
    }
  }

  onSlideChanged($event) {
    let questionIndex = $event.activeIndex - 1;
    if ($event.activeIndex == this.gameService.numberQuestions + 1)
      questionIndex = 0;
    this.startQuestion(questionIndex);
  }

  startQuestion(questionIndex) {
    Toast.showLongBottom(`${questionIndex} - ${this.listQuestion[questionIndex].question} - ${this.listQuestion[questionIndex].answer}`).subscribe(() => {});
    this.currentQuestion = questionIndex;
    this.generateQuote(questionIndex);
    this.progressPercent = (questionIndex + 1) / this.gameService.numberQuestions * 100;
    this.selectedOption = -1;
    let interval = 500;
    let timeLimit = this.gameService.timeLimit * 1000;
    let countdown = timeLimit;
    this.intervalCountdown = setInterval(() => {
      this.countdownPercent = countdown / timeLimit * 100;
      countdown -= interval;
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
      clearInterval(this.intervalCountdown);
      this.intervalCountdown = null;
    }
  }

  select(question, optionIndex) {
    this.stopQuestion();
    this.selectedOption = optionIndex;
    this.isCorrect = this.selectedOption == question.answer;
    if (!this.isCorrect)
      this.numberWrongAnswer++;
  }

  close() {
    NativeAudio.play('touch', ()=>{});
    this.stopQuestion();
    this.navController.pop();
  }

  generateQuote(questionIndex) {
    if (questionIndex == 0) this.quote = QUOTES.FIRST_QUESTION;
    else if (this.numberWrongAnswer > 0) {
      this.quote = QUOTES.WRONG_ANSWER;
    } else {
      if (questionIndex == Math.floor(this.gameService.numberQuestions / 2)) {
        this.quote = QUOTES.HALF_WAY;
      } else {
        this.quote = QUOTES.CORRECT_QUESTION;
      }
    }
  }

  updateDatabase() {
    if (this.success) {
      this.data.achievements.push({
        level: this.data.currentLevel,
        numberQuestions: this.gameService.numberQuestions,
        numberPlay: this.data.numberPlay + 1,
        date: new Date()
      });
      this.data.currentLevel++;
      this.data.numberPlay = 0;
    } else {
      this.data.numberPlay++;
    }
    this.dbService.updateGameMultipleChoice(this.data);
  }

  playNextLevel() {
    NativeAudio.play('touch', ()=>{});
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.gameService.generateListQuestion();
    SpinnerDialog.hide();
    this.resetGame();
    this.slideToBeginning();
  }

  playAgain() {
    NativeAudio.play('touch', ()=>{});
    this.resetGame();
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
