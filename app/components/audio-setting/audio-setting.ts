import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {IONIC_DIRECTIVES, NavController, Modal} from 'ionic-angular';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {Subscription} from 'rxjs';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {SelectedWords} from '../selected-words/selected-words';
import {WordSlides} from '../../pages/word-slides/word-slides';

@Component({
  selector: 'audio-setting',
  templateUrl: 'build/components/audio-setting/audio-setting.html',
  directives: [IONIC_DIRECTIVES],
})
export class AudioSetting implements OnInit, OnDestroy {
  isDisable: boolean = true;
  isContinue: boolean = false;
  settingSubscription: Subscription;
  fullHeight: boolean = false;
  countWords: number = 0;

  constructor(private audioService: AudioService, private settingService: SettingService,
    private sliderService: SliderService, private translate: TranslateService,
    private navController: NavController) {
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
    if (this.isContinue) {
      this.audioService.generateListWordOrder();
      this.audioService.playCurrentTrack();
    } else {
      SpinnerDialog.show(this.translate.instant('Processing'),
        this.translate.instant('Please_wait'), false);
      this.settingService.playAudio();
      this.audioService.playSetting();
      this.sliderService.resetSlider();
    }
    this.navController.push(WordSlides);
  }

  toggleLoop() {
    this.audioService.toggleLoop();
  }

  toggleShuffle() {
    this.audioService.toggleShuffle();
  }

  showSelectedWords() {
    let profileModal = Modal.create(SelectedWords);
    this.navController.present(profileModal);
  }
}
