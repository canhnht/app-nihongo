import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Facebook, Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subject } from 'rxjs';
import * as utils from '../utils';

declare var require: any;
let firebase = require('firebase');

@Injectable()
export class AuthService {
  isLoggedIn: boolean = false;
  currentUser: any = {};
  authSubject: Subject<any> = new Subject<any>();

  constructor(private storage: Storage, private translate: TranslateService) {
    this.checkLoginState();
  }

  checkLoginState() {
    firebase.auth().onAuthStateChanged((user) => {
      this.saveUser(user);
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
      this.pushState();
    });
  }

  private pushState() {
    this.authSubject.next({
      isLoggedIn: this.isLoggedIn,
      currentUser: this.currentUser
    });
  }

  private saveUser(user) {
    if (user) {
      let { displayName, email, photoUrl, uid } = user;
      this.currentUser = { displayName, email, photoUrl, uid };
      return this.storage.set('user', { displayName, email, photoUrl, uid });
    } else {
      return this.storage.set('user', null);
    }
  }

  loginWithFacebook() {
    return Facebook.login([ 'public_profile', 'email' ]).then((response) => {
      let facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
      let signInPromise = Promise.resolve(firebase.auth().signInWithCredential(facebookCredential));
      return signInPromise.then((user) => {
        this.isLoggedIn = true;
      }).catch(this.handleLoginError);
    }).catch(utils.errorHandler(this.translate.instant('Error_login_facebook')));
  }

  handleLoginError(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
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
