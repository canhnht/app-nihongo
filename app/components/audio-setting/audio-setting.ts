import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'audio-setting',
  templateUrl: 'build/components/audio-setting/audio-setting.html',
  directives: [IONIC_DIRECTIVES],
})
export class AudioSetting implements OnInit, OnDestroy {
  @Output() onPageTransfer = new EventEmitter();
  isDisable: boolean = true;
  isContinue: boolean = false;
  settingSubscription: Subscription;

  constructor(private audioService: AudioService, private settingService: SettingService,
    private sliderService: SliderService) {
  }

  ngOnInit() {
    this.isDisable = this.settingService.status === SettingStatus.None;
    this.isContinue = this.settingService.status === SettingStatus.Playing;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        this.isDisable = setting.status === SettingStatus.None;
        this.isContinue = setting.status === SettingStatus.Playing;
      }
    )
  }

  ngOnDestroy() {
    this.settingSubscription.unsubscribe();
  }

  playAudio() {
    if (this.isContinue) {
      this.audioService.playCurrentTrack();
      this.audioService.generateListWordOrder();
    } else {
      SpinnerDialog.show('Processing', 'Please wait a second', false);
      this.audioService.playSetting();
      this.settingService.playAudio();
      this.sliderService.resetSlider();
    }
    this.onPageTransfer.emit({});
  }

  toggleLoop() {
    this.audioService.toggleLoop();
  }

  toggleShuffle() {
    this.audioService.toggleShuffle();
  }
}
