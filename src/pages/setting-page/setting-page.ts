import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  templateUrl: 'setting-page.html',
})
export class SettingPage {
  timeBetweenWords: number;
  repeatEachWord: number;

  constructor(private alertCtrl: AlertController,
    private translate: TranslateService, private storageService: LocalStorageService) {
    this.storageService.get('time_between_words').then(res => this.timeBetweenWords = res);
    this.storageService.get('repeat_each_word').then(res => this.repeatEachWord = res);
  }

  selectLanguage() {
    let languageAlert = this.alertCtrl.create();
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
      languageAlert.present();
    });
  }

  setTimeBetweenWords() {
    this.storageService.set('time_between_words', this.timeBetweenWords);
  }

  setRepeatEachWord() {
    this.storageService.set('repeat_each_word', this.repeatEachWord);
  }
}
