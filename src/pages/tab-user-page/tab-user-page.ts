import { Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../services';

declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'tab-user-page.html'
})
export class TabUserPage {
  isLoggedIn: boolean = false;
  currentUser: any = {};
  authSubscription: Subscription;

  constructor(private authService: AuthService, private translate: TranslateService,
    private zone: NgZone) {

  }

  ionViewWillEnter() {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.currentUser = this.authService.currentUser;
    this.getUserInfo();
    this.authSubscription = this.authService.authSubject.subscribe(({ isLoggedIn, currentUser }) => {
      this.zone.run(() => {
        this.isLoggedIn = isLoggedIn;
        this.currentUser = currentUser;
        this.getUserInfo();
      });
    });
  }

  private getUserInfo() {
    firebase.database().ref(`users/${this.currentUser.uid}`).once('value').then((snapshot) => {
      let userInfo = snapshot.val();
      if (!userInfo) this.initUser();
      else {
        this.currentUser = Object.assign({}, this.currentUser, userInfo);
      }
    }).catch((err) => {
    });
  }

  private initUser() {
    this.currentUser = Object.assign({
      level: 'N3',
      numberWordsLearned: 0,
      exp: 0,
      currentCourse: null,
      courses: []
    }, this.currentUser);
    firebase.database().ref(`users/${this.currentUser.uid}`).set({
      level: 'N3',
      numberWordsLearned: 0,
      exp: 0,
      currentCourse: null,
      courses: []
    });
  }

  ionViewWillLeave() {
    this.authSubscription.unsubscribe();
  }

  loginWithFacebook() {
    this.authService.loginWithFacebook().then(() => {
      Toast.showLongBottom(this.translate.instant('Login_facebook_success')).subscribe(() => {});
    });
  }
}
