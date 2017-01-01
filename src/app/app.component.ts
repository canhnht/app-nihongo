import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar, Splashscreen, NativeAudio } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { LoginPage, HomePage } from '../pages';
import { LocalStorageService, DbService } from '../services';
import { ASSETS_BASE_URL } from '../constants';
import { firebaseConfig } from './config-local';

declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild('content') nav: NavController;
  rootPage = HomePage;
  homePage = HomePage;

  constructor(private platform: Platform, private translate: TranslateService,
    private storageService: LocalStorageService, private dbService: DbService) {
    this.initializeApp();
  }

  initializeApp() {
    this.initializeI18n();
    firebase.initializeApp(firebaseConfig);

    this.platform.ready().then(() => {
      return this.storageService.init();
    }).then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
      NativeAudio.preloadSimple('touch', `${ASSETS_BASE_URL}/sounds/touch.mp3`).then(()=>{},()=>{});
      NativeAudio.preloadSimple('correct', `${ASSETS_BASE_URL}/sounds/correct.wav`).then(()=>{},()=>{});
      NativeAudio.preloadSimple('incorrect', `${ASSETS_BASE_URL}/sounds/incorrect.mp3`).then(()=>{},()=>{});
      NativeAudio.preloadSimple('fail', `${ASSETS_BASE_URL}/sounds/fail.wav`).then(()=>{},()=>{});
      NativeAudio.preloadSimple('success', `${ASSETS_BASE_URL}/sounds/success.wav`).then(()=>{},()=>{});
      NativeAudio.preloadSimple('count_down_5', `${ASSETS_BASE_URL}/sounds/count_down_5.mp3`).then(()=>{},()=>{});
    });
  }

  initializeI18n() {
    let userLang = 'vi';
    this.translate.setDefaultLang('vi');
    this.translate.use(userLang);
  }

  // openPage(page, params, isBack = false) {
  //   let lastView = this.nav.last();
  //   while (lastView.componentType !== HomePage
  //     && lastView.componentType !== PlaylistsPage
  //     && lastView.componentType !== FeedbackPage
  //     && lastView.componentType !== SettingPage
  //     && lastView.componentType !== LoginPage
  //     && lastView.componentType !== GamePage) {
  //     lastView = this.nav.getPrevious(lastView);
  //   }
  //   if (isBack) {
  //     if (lastView.componentType !== page)
  //       this.nav.push(page, params);
  //   } else
  //     this.nav.setRoot(page, params);
  // }
}
