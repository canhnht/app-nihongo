import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { SpinnerDialog } from 'ionic-native';
import { AudioService, SliderService, SettingService, SettingStatus  } from '../../services';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { SelectedWords } from '../selected-words/selected-words';
// import { WordSlides } from '../../pages';

@Component({
  selector: 'audio-setting',
  templateUrl: 'audio-setting.html',
})
export class AudioSetting implements OnInit, OnDestroy {
  isDisable: boolean = true;
  isContinue: boolean = false;
  settingSubscription: Subscription;
  fullHeight: boolean = false;
  countWords: number = 0;

  constructor(private audioService: AudioService, private settingService: SettingService,
    private sliderService: SliderService, private translate: TranslateService,
    private navCtrl: NavController, private modalCtrl: ModalController) {
  }

  toggleFullHeight() {
    this.fullHeight = !this.fullHeight;
  }

  ngOnInit() {
    this.isDisable = this.settingService.status === SettingStatus.None;
    this.isContinue = this.settingService.status === SettingStatus.Playing;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        this.isDisable = setting.status === SettingStatus.None;
        this.isContinue = setting.status === SettingStatus.Playing;
        this.countWords = setting.countWords;
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
      // this.navCtrl.push(WordSlides);
    } else {
      this.settingService.playAudio();
      this.sliderService.resetSlider();
      this.audioService.playSetting().then(() => {
        // this.navCtrl.push(WordSlides);
      });
    }
  }

  toggleLoop() {
    this.audioService.toggleLoop();
  }

  toggleShuffle() {
    this.audioService.toggleShuffle();
  }

  showSelectedWords() {
    let profileModal = this.modalCtrl.create(SelectedWords);
    profileModal.present();
  }
}
