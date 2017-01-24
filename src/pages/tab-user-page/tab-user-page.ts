import { Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService, LocalStorageService } from '../../services';

declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'tab-user-page.html'
})
export class TabUserPage {
  isLoggedIn: boolean = false;
  currentUser: any = null;
  authSubscription: Subscription;

  constructor(private authService: AuthService, private translate: TranslateService,
    private zone: NgZone, private storageService: LocalStorageService) {
  }

  ionViewWillEnter() {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.currentUser = this.authService.currentUser;
    if (this.isLoggedIn) this.startTrackUserInfo(this.currentUser.uid);
    this.authSubscription = this.authService.authSubject.subscribe(({ isLoggedIn, currentUser }) => {
      this.zone.run(() => {
        this.isLoggedIn = isLoggedIn;
        this.currentUser = currentUser;
        if (this.isLoggedIn) this.startTrackUserInfo(this.currentUser.uid);
      });
    });
  }

  ionViewWillLeave() {
    this.authSubscription.unsubscribe();
  }

  startTrackUserInfo(uid) {
    firebase.database().ref(`users/${uid}`).on('value', (snapshot) => {
      let userInfo = snapshot.val();
      if (userInfo) this.currentUser = Object.assign({}, this.currentUser, userInfo);
    });
  }

  loginWithFacebook() {
    this.authService.loginWithFacebook().then(() => {
      Toast.showLongBottom(this.translate.instant('Login_facebook_success')).subscribe(() => {});
    });
  }

  logoutFacebook() {
    this.authService.logoutFacebook().then(() => {
      Toast.showLongBottom(this.translate.instant('Logout_facebook_success')).subscribe(() => {});
    });
  }
}
