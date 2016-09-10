import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/setting-page/setting-page.html',
})
export class SettingPage {
  timeBetweenWords: number;
  repeatEachWord: number;

  constructor(private navController: NavController,
    private translate: TranslateService, private storageService: LocalStorageService) {
    this.storageService.get('time_between_words').then(res => this.timeBetweenWords = res);
    this.storageService.get('repeat_each_word').then(res => this.repeatEachWord = res);
  }

  selectLanguage() {
    let languageAlert = Alert.create();
    languageAlert.setTitle(this.translate.instant('Choose_language'));

    this.storageService.get('language').then(res => {
      languageAlert.addInput({
        type: 'radio',
        label: this.translate.instant('Vietnamese'),
        value: 'vi',
        checked: res === 'vi'
      });

      languageAlert.addInput({
        type: 'radio',
        label: this.translate.instant('Japanese'),
        value: 'ja',
        checked: res === 'ja'
      });

      languageAlert.addButton(this.translate.instant('Cancel'));
      languageAlert.addButton({
        text: this.translate.instant('OK'),
        handler: data => {
          this.storageService.set('language', data);
        }
      });
      this.navController.present(languageAlert);
    });
  }

  setTimeBetweenWords() {
    this.storageService.set('time_between_words', this.timeBetweenWords);
  }

  setRepeatEachWord() {
    this.storageService.set('repeat_each_word', this.repeatEachWord);
  }
}
