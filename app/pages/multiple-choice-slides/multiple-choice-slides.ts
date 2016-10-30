import {Component, ViewChild} from '@angular/core';
import {NavController, Slides, Alert, NavParams} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog, MediaPlugin} from 'ionic-native';
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

  resetGame() {
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
  }

  next() {
    if (this.currentQuestion + 1 == this.gameService.numberQuestions) {
      this.answerAll = true;
      this.success = this.numberWrongAnswer == 0;
    } else {
      this.slides.unlockSwipeToNext();
      this.questionSlider.slideNext();
      this.slides.lockSwipeToNext();
    }
  }

  onSlideChanged($event) {
    this.stopQuestion();
    this.startQuestion($event.activeIndex - 1);
  }

  startQuestion(questionIndex) {
    Toast.showLongBottom(`${this.listQuestion[questionIndex].question} - ${questionIndex} - ${this.listQuestion[questionIndex].answer}`).subscribe(() => {});
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
    this.navController.pop();
    this.stopQuestion();
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

  playNextLevel() {
    this.data.achievements.push({
      level: this.data.currentLevel,
      numberQuestions: this.gameService.numberQuestions,
      numberPlay: this.data.numberPlay,
      date: new Date()
    });
    this.data.currentLevel++;
    this.data.numberPlay = 0;
    this.dbService.updateGameMultipleChoice(this.data);
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.gameService.generateListQuestion();
    SpinnerDialog.hide();
    this.resetGame();
  }

  playAgain() {
    this.data.numberPlay++;
    this.dbService.updateGameMultipleChoice(this.data);
    this.resetGame();
    this.startQuestion(0);
  }

  saveAndClose() {
    if (this.success) {
      this.data.achievements.push({
        level: this.data.currentLevel,
        numberQuestions: this.gameService.numberQuestions,
        numberPlay: this.data.numberPlay,
        date: new Date()
      });
      this.data.currentLevel++;
      this.data.numberPlay = 0;
    } else {
      this.data.numberPlay++;
    }
    this.dbService.updateGameMultipleChoice(this.data);
    this.navController.pop();
  }
}
