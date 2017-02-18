import { Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService, LocalStorageService, DbService } from '../../services';
import { AnalyticsService, Events, Params } from '../../services';

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
    private zone: NgZone, private storageService: LocalStorageService,
    private analytics: AnalyticsService, private dbService: DbService) {
  }

  ionViewWillEnter() {
    this.analytics.logEvent(Events.VIEW_PROFILE);
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
    if (this.isLoggedIn)
      this.stopTrackUserInfo(this.currentUser.uid);
  }

  startTrackUserInfo(uid) {
    firebase.database().ref(`users/${uid}`).on('value', (snapshot) => {
      let userInfo = snapshot.val();
      if (userInfo) {
        if (userInfo.courses) {
          let listCourseId = Object.keys(userInfo.courses);
          this.dbService.getCoursesById(listCourseId).then((courses) => {
            userInfo.courses = courses.map((course) => Object.assign({
              learned: userInfo.courses[course.id]
            }, course));
            this.zone.run(() => {
              this.currentUser = Object.assign({}, this.currentUser, userInfo);
            });
          });
        } else {
          this.zone.run(() => {
            this.currentUser = Object.assign({}, this.currentUser, userInfo);
          });
        }
      }
    });
  }

  stopTrackUserInfo(uid) {
    firebase.database().ref(`users/${uid}`).off('value');
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
