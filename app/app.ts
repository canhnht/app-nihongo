import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {LoginPage} from './pages/login-page/login-page';
import {PlaylistsPage} from './pages/playlists-page/playlists-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {CourseService} from './services/course.service';
import {WordSlides} from './pages/word-slides/word-slides';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  rootPage = LoginPage;

  constructor(private platform: Platform) {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyDoRI41vY0FIrejvn4jBXshgVxlUKR3zvM",
      authDomain: "app-nihongo-techybrain.firebaseapp.com",
      databaseURL: "https://app-nihongo-techybrain.firebaseio.com",
      storageBucket: "app-nihongo-techybrain.appspot.com",
    };
    firebase.initializeApp(config);

    this.platform.ready()
      .then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
      })
  }

  openPage(page) {
    this.rootPage = page;
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService, CourseService]);
