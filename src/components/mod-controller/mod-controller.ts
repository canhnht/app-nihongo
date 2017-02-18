import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavController, ModalController, Slides } from 'ionic-angular';
import { Toast } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { WordSlides } from '../../pages';
import { LearningSlides } from '../../pages';
import { AudioService, SliderService, SettingService, LoaderService } from '../../services';
import { SettingStatus } from '../../helpers/custom-types';

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
  modControlOptions: any = {
    loop: false
  };
  @ViewChild('modControl') modControl: Slides;

  constructor(private audioService: AudioService, private settingService: SettingService,
    private sliderService: SliderService, private translate: TranslateService,
    private navCtrl: NavController, private loader: LoaderService) {
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
    this.loader.show();
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

  isSelectedWord() {
    if (this.isDisable) {
      Toast.hide();
      Toast.showShortCenter(this.translate.instant('Please_choose_word')).subscribe(() => {});
      return false;
    }
    return true;
  }

  startLearn() {
    this.loader.show();
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
