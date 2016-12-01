import {Component, PLATFORM_PIPES, ViewChild} from '@angular/core';
import {Http} from '@angular/http';
import {Platform, ionicBootstrap, NavController} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast, NativeAudio} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {NewsPage} from './pages/news-page/news-page';
import {NewsDetail} from './pages/news-detail/news-detail';
import {LoginPage} from './pages/login-page/login-page';
import {SettingPage} from './pages/setting-page/setting-page';
import {FeedbackPage} from './pages/feedback-page/feedback-page';
import {PlaylistsPage} from './pages/playlists-page/playlists-page';
import {GamePage} from './pages/game-page/game-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {DbService} from './services/db.service';
import {WordSlides} from './pages/word-slides/word-slides';
import {AuthService} from './services/auth.service';
import {SettingService} from './services/setting.service';
import {LocalStorageService} from './services/local-storage.service';
import {GameMultipleChoiceService} from './services/game-multiple-choice.service';
import {TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {firebaseConfig} from './config-local';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  @ViewChild('content') navController: NavController;
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  settingPage = SettingPage;
  feedbackPage = FeedbackPage;
  gamePage = GamePage;
  rootPage = LoginPage;
  isSignedIn: boolean = false;

  constructor(private platform: Platform, private authService: AuthService,
    private translate: TranslateService, private storageService: LocalStorageService) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    this.platform.ready().then(() => {
      return this.storageService.init();
    }).then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
      this.authService.checkLoginStatus().then(() => {
        this.isSignedIn = this.authService.isSignedIn;
      });
      NativeAudio.preloadSimple('touch', 'sounds/touch.mp3').then(()=>{},()=>{});
      NativeAudio.preloadSimple('correct', 'sounds/correct.wav').then(()=>{},()=>{});
      NativeAudio.preloadSimple('incorrect', 'sounds/incorrect.mp3').then(()=>{},()=>{});
      NativeAudio.preloadSimple('fail', 'sounds/fail.wav').then(()=>{},()=>{});
      NativeAudio.preloadSimple('success', 'sounds/success.wav').then(()=>{},()=>{});
      NativeAudio.preloadSimple('count_down_5', 'sounds/count_down_5.mp3').then(()=>{},()=>{});
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

  openPage(page, params, isBack = false) {
    let lastView = this.navController.last();
    while (lastView.componentType !== HomePage
      && lastView.componentType !== PlaylistsPage
      && lastView.componentType !== FeedbackPage
      && lastView.componentType !== SettingPage
      && lastView.componentType !== LoginPage
      && lastView.componentType !== GamePage) {
      lastView = this.navController.getPrevious(lastView);
    }
    if (isBack) {
      if (lastView.componentType !== page)
        this.navController.push(page, params);
    } else
      this.navController.setRoot(page, params);
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
  },
  LocalStorageService,
  GameMultipleChoiceService
]);
