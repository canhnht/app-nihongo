import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Toast, InAppBrowser, Facebook, GooglePlus} from 'ionic-native';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
})
export class LoginPage {
  constructor(public nav: NavController) {
    // InAppBrowser.open('https://google.com');
  }

  signInGoogle() {
    // Toast.showShortCenter('google').subscribe(() => {});
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // firebase.auth().signInWithPopup(provider).then(function(result) {
    //   // This gives you a Google Access Token. You can use it to access the Google API.
    //   var token = result.credential.accessToken;
    //   // The signed-in user info.
    //   var user = result.user;
    //   // ...
    //   // Toast.showLongTop(`${token}, ${JSON.stringify(user)}`).subscribe(() => {});
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    //   // Toast.showLongTop(`ERROR ${JSON.stringify(error)}`).subscribe(() => {});
    // });

    // firebase.auth().signInWithRedirect(provider);
    // firebase.auth().getRedirectResult().then(function(result) {
    //   if (result.credential) {
    //     // This gives you a Google Access Token. You can use it to access the Google API.
    //     var token = result.credential.accessToken;
    //     // ...
    //   }
    //   // The signed-in user info.
    //   var user = result.user;
    //   Toast.showLongTop(`${token}, ${JSON.stringify(user)}`).subscribe(() => {});
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    //   Toast.showLongTop(`ERROR ${JSON.stringify(error)}`).subscribe(() => {});
    // });


    // InAppBrowser.open('https://google.com', '_self', 'location=no');


    GooglePlus.login({
      'webClientId': '592322221073-pdp71g7r2ktnlvghhsh6fqlke0k59cag.apps.googleusercontent.com'
    }).then(response => {
      Toast.showLongCenter(`${JSON.stringify(response)}`).subscribe(() => {});
    }).catch(err => {
      Toast.showLongCenter(`${JSON.stringify(err)}`).subscribe(() => {});
    });
  }

  signInFacebook() {
    // Toast.showShortCenter('facebook').subscribe(() => {});
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_birthday');
    // firebase.auth().signInWithPopup(provider).then(function(result) {
    //   // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    //   var token = result.credential.accessToken;
    //   // The signed-in user info.
    //   var user = result.user;
    //   // ...
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });

    // firebase.auth().signInWithRedirect(provider);
    // firebase.auth().getRedirectResult().then(function(result) {
    //   if (result.credential) {
    //     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    //     var token = result.credential.accessToken;
    //     // ...
    //   }
    //   // The signed-in user info.
    //   var user = result.user;
    //   Toast.showLongTop(`${token}, ${JSON.stringify(user)}`).subscribe(() => {});
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    //   Toast.showLongTop(`ERROR ${JSON.stringify(error)}`).subscribe(() => {});
    // });


    // InAppBrowser.open('https://google.com', '_blank', 'location=no');


    Facebook.login(['public_profile', 'email']).then(response => {
      Toast.showLongCenter(`${JSON.stringify(response)}`).subscribe(() => {});
    }).catch(err => {
      Toast.showLongCenter(`${JSON.stringify(err)}`).subscribe(() => {});
    });
  }
}
