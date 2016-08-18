import {Component, PLATFORM_PIPES} from '@angular/core';
import {Http} from '@angular/http';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {LoginPage} from './pages/login-page/login-page';
import {SettingPage} from './pages/setting-page/setting-page';
import {FeedbackPage} from './pages/feedback-page/feedback-page';
import {PlaylistsPage} from './pages/playlists-page/playlists-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {DbService} from './services/db.service';
import {WordSlides} from './pages/word-slides/word-slides';
import {AuthService} from './services/auth.service';
import {SettingService} from './services/setting.service';
import {TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {firebaseConfig} from './config-local';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  settingPage = SettingPage;
  feedbackPage = FeedbackPage;
  rootPage = HomePage;
  isSignedIn: boolean = false;

  constructor(private platform: Platform, private authService: AuthService,
    private translate: TranslateService) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    this.platform.ready()
      .then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
        this.authService.checkLoginStatus().then(() => {
          this.isSignedIn = this.authService.isSignedIn;
        });
      });

    this.initializeI18n();
  }

  initializeI18n() {
    let userLang = 'vi';
    // var userLang = navigator.language.split('-')[0];
    // userLang = /(de|en|hr)/gi.test(userLang) ? userLang : 'en';

    this.translate.setDefaultLang('vi');
    this.translate.use(userLang);
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

ionicBootstrap(MyApp, [
  AudioService,
  SliderService,
  DbService,
  AuthService,
  SettingService,
  {
    provide: TranslateLoader,
    useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n', '.json'),
    deps: [Http],
  },
  TranslateService,
  {
    provide: PLATFORM_PIPES,
    useValue: TranslatePipe,
    multi: true,
  }
]);
