import { Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, Network } from 'ionic-native';
import { App, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService, LocalStorageService, DbService, SettingService } from '../../services';
import { AnalyticsService, Events, Params } from '../../services';
import { UnitsPage } from '../units-page/units-page';

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
    private zone: NgZone, private storageService: LocalStorageService,
    private analytics: AnalyticsService, private dbService: DbService,
    private alertCtrl: AlertController, private settingService: SettingService,
    private app: App) {
  }

  ionViewWillEnter() {
    this.analytics.logEvent(Events.VIEW_PROFILE);
    this.isLoggedIn = this.authService.isLoggedIn;
    this.getCoursesHistory(this.authService.currentUser.courses)
      .then((courses) => {
        this.zone.run(() => {
          this.currentUser = Object.assign({}, this.authService.currentUser, { courses });
        });
        if (this.isLoggedIn) this.startTrackUserInfo(this.currentUser.uid);
      });
    this.authSubscription = this.authService.authSubject.subscribe(({ isLoggedIn, currentUser }) => {
      this.isLoggedIn = isLoggedIn;
      this.getCoursesHistory(this.authService.currentUser.courses)
        .then((courses) => {
          this.zone.run(() => {
            this.currentUser = Object.assign({}, this.authService.currentUser, { courses });
          });
          if (this.isLoggedIn) this.startTrackUserInfo(this.currentUser.uid);
        });
    });
  }

  ionViewWillLeave() {
    this.authSubscription.unsubscribe();
    if (this.isLoggedIn)
      this.stopTrackUserInfo(this.currentUser.uid);
  }

  private getCoursesHistory(courses) {
    if (!courses) return Promise.resolve([]);
    let listCourseId = Object.keys(courses);
    return this.dbService.getCoursesById(listCourseId).then((listCourse) => {
      return listCourse.map((course) => Object.assign({
        learned: courses[course.id]
      }, course));
    });
  }

  checkBeforeDownload(course) {
    if (course.downloaded) {
      this.goToCourse(course);
    } else {
      let alert = this.alertCtrl.create({
        title: this.translate.instant('Error_open_course'),
        subTitle: this.translate.instant('Course_not_downloaded'),
        buttons: [this.translate.instant('OK')]
      });
      alert.present();
    }
  }

  private goToCourse(course) {
    this.analytics.logEvent(Events.VIEW_COURSE, {
      [Params.COURSE_ID]: course.id,
      [Params.COURSE_NAME]: course.name,
      [Params.COURSE_LEVEL]: course.level
    });
    this.authService.saveHistory(course);
    this.settingService.reset(true);
    this.app.getRootNav().push(UnitsPage, {selectedCourse: course});
  }

  startTrackUserInfo(uid) {
    firebase.database().ref(`users/${uid}`).on('value', (snapshot) => {
      let userInfo = snapshot.val();
      if (userInfo) {
        this.getCoursesHistory(userInfo.courses).then((courses) => {
          userInfo.courses = courses;
          this.zone.run(() => {
            this.currentUser = Object.assign({}, this.currentUser, userInfo);
          });
        });
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
