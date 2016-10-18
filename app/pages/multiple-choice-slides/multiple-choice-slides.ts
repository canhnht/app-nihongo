import {Component, ViewChild} from '@angular/core';
import {NavController, Slides, Alert, NavParams} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog, MediaPlugin} from 'ionic-native';
import {Subscription} from 'rxjs';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {GameMultipleChoiceService} from '../../services/game-multiple-choice.service';

@Component({
  templateUrl: 'build/pages/multiple-choice-slides/multiple-choice-slides.html'
})
export class MultipleChoiceSlides {
  @ViewChild('questionSlider') questionSlider: Slides;

  sliderOptions: any = {
    loop: false,
    onInit: function(slides) {
      slides.lockSwipeToPrev();
    }
  };
  listQuestion: any[];

  constructor(private navController: NavController, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private gameService: GameMultipleChoiceService) {
    this.listQuestion = [...this.gameService.listQuestion];
    this.listQuestion.forEach(question => {
      question.selected = -1;
    });
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  prev() {
    this.questionSlider.slidePrev();
  }

  next() {
    this.questionSlider.slideNext();
  }

  select(question, optionIndex) {
    question.selected = optionIndex;
    setTimeout(() => {
      Toast.showLongTop(`next`).subscribe(() => {});
      this.next();
    }, 2000);
  }

  close() {
    this.navController.pop();
  }
}
