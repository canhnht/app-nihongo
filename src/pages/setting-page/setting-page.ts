import { Component, NgZone } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { LocalStorageService, AuthService } from '../../services';

@Component({
  templateUrl: 'setting-page.html',
})
export class SettingPage {
  timeBetweenWords: number;
  repeatEachWord: number;
  loginText: string;
  authSubscription: Subscription;

  constructor(private alertCtrl: AlertController, private authService: AuthService,
    private translate: TranslateService, private storageService: LocalStorageService,
    private zone: NgZone) {
    this.storageService.get('time_between_words').then(res => this.timeBetweenWords = res);
    this.storageService.get('repeat_each_word').then(res => this.repeatEachWord = res);
  }

  ionViewWillEnter() {
    this.setLoginText(this.authService.isLoggedIn, this.authService.currentUser);
    this.authSubscription = this.authService.authSubject.subscribe(({ isLoggedIn, currentUser}) => {
      this.zone.run(() => this.setLoginText(isLoggedIn, currentUser));
    });
  }

  ionViewWillLeave() {
    this.authSubscription.unsubscribe();
  }

  private setLoginText(isLoggedIn, currentUser) {
    if (isLoggedIn) {
      this.loginText = this.translate.instant('Logout_facebook', {
        email: currentUser.email
      });
    } else {
      this.loginText = this.translate.instant('Login_facebook');
    }
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

  toggleAuthFacebook() {
    if (this.authService.isLoggedIn) {
      this.authService.logoutFacebook().then(() => {
        Toast.showLongBottom(this.translate.instant('Logout_facebook_success')).subscribe(() => {});
      });
    } else {
      this.authService.loginWithFacebook().then(() => {
        Toast.showLongBottom(this.translate.instant('Login_facebook_success')).subscribe(() => {});
      });
    }
  }
}
