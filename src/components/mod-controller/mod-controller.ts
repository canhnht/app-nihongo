import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavController, ModalController, Slides } from 'ionic-angular';
import { SpinnerDialog, Toast } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { SelectedWords } from '../selected-words/selected-words';
import { WordSlides } from '../../pages';
import { LearningSlides } from '../../pages';
import { AudioService, SliderService, SettingService  } from '../../services';
import { SettingStatus } from '../../helpers/custom-types';

/*
  Generated class for the ModController component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'mod-controller',
  templateUrl: 'mod-controller.html'
})
export class ModControllerComponent implements OnInit, OnDestroy {
  isDisable: boolean = true;
  isContinue: boolean = false;
  settingSubscription: Subscription;
  fullHeight: boolean = false;
  countWords: number = 0;
  modControlOptions: any;
  @ViewChild('modControl') modControl: Slides;

  constructor(private audioService: AudioService, private settingService: SettingService,
    private sliderService: SliderService, private translate: TranslateService,
    private navCtrl: NavController, private modalCtrl: ModalController) {
    this.modControlOptions = {
      loop: true
    };
  }

   toggleFullHeight() {
    this.fullHeight = !this.fullHeight;
  }

  ngOnInit() {
    this.audioService.resetLoop();
    this.audioService.resetShuffle();
    this.isDisable = this.settingService.status === SettingStatus.None;
    this.isContinue = this.settingService.status === SettingStatus.Playing;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        this.isDisable = setting.status === SettingStatus.None;
        this.isContinue = setting.status === SettingStatus.Playing;
        this.countWords = setting.countWords;
        if(this.isDisable){
          this.audioService.resetLoop();
          this.audioService.resetShuffle();
        }
      }
    )
  }

  ngOnDestroy() {
    this.settingSubscription.unsubscribe();
  }

  playAudio() {
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    if (this.isContinue) {
      this.audioService.generateListWordOrder();
      this.audioService.playCurrentTrack();
      this.navCtrl.push(WordSlides);
    } else {
      this.settingService.playAudio();
      this.sliderService.resetSlider();
      this.audioService.playSetting().then(() => {
        this.navCtrl.push(WordSlides);
      });
    }
  }

  toggleLoop() {
    if (this.isSelectedWord())
      this.audioService.toggleLoop();
  }

  toggleShuffle() {
    if(this.isSelectedWord())
      this.audioService.toggleShuffle();
  }

  showSelectedWords() {
    let profileModal = this.modalCtrl.create(SelectedWords);
    profileModal.present();
  }

  isSelectedWord() {
    if (this.isDisable) {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Please_choose_word')).subscribe(() => {});
      return false;
    }
    return true;
  }

  startLearn() {
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.navCtrl.push(LearningSlides, {
      listWord: this.settingService.selectedWords
    });
  }

  prev() {
    this.modControl.slidePrev();
  }

  next() {
    this.modControl.slideNext();
  }

}
