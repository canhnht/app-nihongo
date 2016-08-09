import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {LoginPage} from './pages/login-page/login-page';
import {PlaylistsPage} from './pages/playlists-page/playlists-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {DbService} from './services/db.service';
import {WordSlides} from './pages/word-slides/word-slides';
import {AuthService} from './services/auth.service';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  rootPage = HomePage;
  isSignedIn: boolean = false;

  constructor(private platform: Platform, private authService: AuthService) {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyALm56LkjP4JQeNcCWA5XWPJ-xD7jAdXDs",
      authDomain: "mimi-kara-nihongo.firebaseapp.com",
      databaseURL: "https://mimi-kara-nihongo.firebaseio.com",
      storageBucket: "mimi-kara-nihongo.appspot.com",
    };
    firebase.initializeApp(config);

    this.platform.ready()
      .then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
        this.authService.checkLoginStatus().then(() => {
          this.isSignedIn = this.authService.isSignedIn;
        });
      });
  }

  signIn() {
    this.authService.signInWithFacebook().then(() => {
      this.isSignedIn = this.authService.isSignedIn;
    });
  }

  signOut() {
    this.authService.signOut().then(() => {
      this.isSignedIn = false;
    });
  }

  openPage(page) {
    this.rootPage = page;
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService, DbService, AuthService]);
