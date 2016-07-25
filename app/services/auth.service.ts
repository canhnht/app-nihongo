import {Injectable} from '@angular/core';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import * as utils from '../utils';
import {Subject, Observable} from 'rxjs';
declare var require: any;
let firebase = require('firebase');

@Injectable()
export class AuthService {
  isSignedIn: boolean = false;
  unsubscribeAuthState: any;

  constructor() {
  }

  checkLoginStatus() {
    return Facebook.getLoginStatus().then(response => {
      Toast.showLongCenter(`checkLoginStatus ${response.status}`).subscribe(() => {});
      this.isSignedIn = !!response && response.status === 'connected';
      if (this.isSignedIn)
        Toast.showShortBottom('You are already signed in').subscribe(() => {});
    }).catch(utils.errorHandler('Error get facebook login status'));
  }

  // subscribeAuthState() {
  //   this.unsubscribeAuthState = firebase.auth().onAuthStateChanged(function(firebaseUser) {
  //     alert('constructor ' + JSON.stringify(firebaseUser));
  //   });
  // }

  signInWithFacebook() {
    return Facebook.login(['public_profile', 'email', 'user_friends']).then(response => {
      this.checkLoginState(response);
    }).catch(utils.errorHandler('Error sign in with facebook'));
  }

  private checkLoginState(event) {
    if (event.authResponse) {
      this.isSignedIn = true;
      var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
        unsubscribe();
        if (!firebaseUser) {
          var credential = firebase.auth.FacebookAuthProvider.credential(
              event.authResponse.accessToken);
          firebase.auth().signInWithCredential(credential).then(resp => {
            Toast.showShortBottom('Sign in successfully').subscribe(() => {});
          }).catch(utils.errorHandler('Error sign in with credential'));
        }
      });
    } else {
      this.signOut();
    }
  }

  signOut() {
    firebase.auth().signOut().then(function(resp) {
    }).catch(utils.errorHandler('Error sign out'));

    return Facebook.logout().then(resp => {
      this.isSignedIn = false;
      Toast.showShortBottom('Sign out successfully').subscribe(() => {});
    }).catch(utils.errorHandler('Error sign out facebook'));
  }
}
