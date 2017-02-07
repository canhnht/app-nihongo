import { Component, NgZone } from '@angular/core';
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
  language: string;
  loginText: string;
  authSubscription: Subscription;

  constructor(private authService: AuthService, private zone: NgZone,
    private translate: TranslateService, private storageService: LocalStorageService) {
    this.storageService.get('time_between_words').then((res) => this.timeBetweenWords = res);
    this.storageService.get('repeat_each_word').then((res) => this.repeatEachWord = res);
    this.storageService.get('language').then((res) => this.language = res);
  }

  ionViewWillEnter() {
    this.setLoginText(this.authService.isLoggedIn, this.authService.currentUser);
    this.authSubscription = this.authService.authSubject.subscribe(({ isLoggedIn, currentUser }) => {
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

  setLanguage() {
    this.storageService.set('language', this.language);
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
