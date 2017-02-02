import { Injectable } from '@angular/core';
import { Facebook, Toast, SpinnerDialog } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { LocalStorageService } from './local-storage.service';
import { AnalyticsService } from './analytics.service';
import { Subject } from 'rxjs';
import * as utils from '../helpers/utils';

declare var require: any;
let firebase = require('firebase');

@Injectable()
export class AuthService {
  isLoggedIn: boolean = false;
  currentUser: any = null;
  authSubject: Subject<any> = new Subject<any>();

  constructor(private storageService: LocalStorageService, private translate: TranslateService,
    private analytics: AnalyticsService) {
    this.checkLoginState();
  }

  checkLoginState() {
    firebase.auth().onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.analytics.setUserId(user.uid);
        let promiseStorageUser = this.storageService.get('user');
        let promiseFirebaseUser = firebase.database().ref(`users/${user.uid}`).once('value').then((snapshot) => snapshot.val());
        Promise.all([ promiseStorageUser, promiseFirebaseUser ]).then((data) => {
          let userInStorage = data[0];
          let userInFirebase = data[1];
          if (!userInStorage) {
            if (!userInFirebase) {  // new sign-in
              this.currentUser = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                avatarUrl: user.photoURL,
                level: 'N3',
                numberWordsLearned: 0,
                exp: 0,
                currentCourse: null,
                courses: []
              };
              this.initUserInFirebase(user)
                .then(() => this.storageService.set('user', this.currentUser))
                .then(() => {
                  SpinnerDialog.hide();
                  this.pushState();
                });
            } else {  // sign-out, then sign-in
              this.currentUser = Object.assign({}, userInFirebase, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                avatarUrl: user.photoURL
              });
              this.updateUserInFirebase(user)
                .then(() => this.storageService.set('user', this.currentUser))
                .then(() => {
                  SpinnerDialog.hide();
                  this.pushState();
                });
            }
          } else {  // already sign-in
            this.currentUser = userInStorage;
            SpinnerDialog.hide();
            this.pushState();
          }
        });
      } else {
        this.analytics.setUserId(null);
        this.storageService.remove('user');
        this.currentUser = null;
        this.pushState();
      }
    });
  }

  pushState() {
    this.authSubject.next({
      isLoggedIn: this.isLoggedIn,
      currentUser: this.currentUser
    });
  }

  private updateUserInFirebase(user) {
    let updates = {};
    updates[`users/${user.uid}/displayName`] = user.displayName;
    updates[`users/${user.uid}/email`] = user.email;
    updates[`users/${user.uid}/avatarUrl`] = user.photoURL;
    return firebase.database().ref().update(updates);
  }

  private initUserInFirebase(user) {
    let userInfo = {
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.photoURL,
      level: 'N3',
      numberWordsLearned: 0,
      exp: 0,
      currentCourse: null,
      courses: []
    };
    return firebase.database().ref(`users/${user.uid}`).set(userInfo);
  }

  loginWithFacebook() {
    return Facebook.login([ 'public_profile', 'email' ]).then((response) => {
      SpinnerDialog.show(this.translate.instant('Processing'),
        this.translate.instant('Please_wait'), false);
      let facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
      let signInPromise = Promise.resolve(firebase.auth().signInWithCredential(facebookCredential));
      return signInPromise.catch(this.handleLoginError);
    }).catch(utils.errorHandler(this.translate.instant('Error_login_facebook')));
  }

  handleLoginError(error) {
    this.isLoggedIn = false;
    var errorCode = error.code;
    var errorMessage = error.message;
    var credential = error.credential;
    var email = error.email;
    switch (errorCode) {
      case 'auth/account-exists-with-different-credential':
        Toast.showShortBottom('Email already associated with another account').subscribe(() => {});
        break;
      case 'auth/invalid-credential':
        Toast.showShortBottom('Invalid credentials').subscribe(() => {});
        break;
      case 'auth/operation-not-allowed':
        Toast.showShortBottom('You are now allowed to perform this operation').subscribe(() => {});
        break;
      case 'auth/user-disabled':
        Toast.showShortBottom('Your account has been disabled').subscribe(() => {});
        break;
      case 'auth/user-not-found':
        Toast.showShortBottom('Your account is not found').subscribe(() => {});
        break;
      case 'auth/wrong-password':
        Toast.showShortBottom('Wrong password').subscribe(() => {});
        break;
    }
  }

  logoutFacebook() {
    return firebase.auth().signOut().catch(utils.errorHandler(this.translate.instant('Error_logout_facebook')));
  }
}
