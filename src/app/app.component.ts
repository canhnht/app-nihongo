import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar, Splashscreen, NativeAudio, LocalNotifications, AdMob, Network } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { HomePage, PlaylistsPage, FeedbackPage, SettingPage, PlaygroundPage, AboutUsPage, SentencePage } from '../pages';
import { LocalStorageService, DbService } from '../services';
import { ASSETS_BASE_URL } from '../helpers/constants';
import { firebaseConfig, oneSignalConfig, admobConfig } from './config-local';

declare var require: any;
let firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild('content') nav: NavController;
  rootPage = HomePage;
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  feedbackPage = FeedbackPage;
  settingPage = SettingPage;
  aboutUsPage = AboutUsPage;

  constructor(private platform: Platform, private translate: TranslateService,
    private storageService: LocalStorageService, private dbService: DbService) {
    this.initializeApp();
  }

  initializeApp() {
    // let initDbSubscription = this.dbService.initSubject.subscribe((init) => {
    //   initDbSubscription.unsubscribe();
    //   if (init) {
    //     this.initializeLocalNotifications();
    //   }
    // });
    this.initializeI18n();
    this.platform.ready().then(() => {
      return this.storageService.init();
    }).then(() => {
      let splashScreen = document.getElementById('splashscreen');
      splashScreen.style.display = 'none';

      StatusBar.styleDefault();
      NativeAudio.preloadSimple('touch', `${ASSETS_BASE_URL}/sounds/touch.mp3`);
      NativeAudio.preloadSimple('correct', `${ASSETS_BASE_URL}/sounds/correct.wav`);
      NativeAudio.preloadSimple('incorrect', `${ASSETS_BASE_URL}/sounds/incorrect.mp3`);
      NativeAudio.preloadSimple('fail', `${ASSETS_BASE_URL}/sounds/fail.wav`);
      NativeAudio.preloadSimple('success', `${ASSETS_BASE_URL}/sounds/success.wav`);
      NativeAudio.preloadSimple('count_down_5', `${ASSETS_BASE_URL}/sounds/count_down_5.mp3`);

      this.initializeAdMod();
    });
  }

  private initializeLocalNotifications() {
    LocalNotifications.on('click', (notification) => {
      let { word, sentence } = JSON.parse(notification.data);
      this.nav.setRoot(SentencePage, { word, sentence });
    });
    document.addEventListener('pause', () => {
      LocalNotifications.getAllIds().then((ids) => {
        if (ids.length == 0)
          LocalNotifications.cancelAll().then(() => {
            this.generateLocalNotifications();
          });
      });
    });
  }

  private generateLocalNotifications() {
    LocalNotifications.hasPermission().then((granted) => {
      if (!granted) return LocalNotifications.registerPermission();
      else return Promise.resolve(true);
    }).then((granted) => {
      if (granted)
        return this.dbService.getRandomWords(3).then((randomWords) => {
          let notifications = randomWords.map((word, index) => {
            return {
              id: index,
              title: `${this.translate.instant('Learn_now')} - ${word.kanji}`,
              text: word.mainExample.content,
              icon: 'res://icon.png',
              every: 'day',
              data: {
                word,
                sentence: word.mainExample
              }
            };
          });
          notifications.forEach((item) => LocalNotifications.schedule(item));
        });
    });
  }

  private initializeI18n() {
    let userLang = 'vi';
    this.translate.setDefaultLang('vi');
    this.translate.use(userLang);
  }

  private initializeAdMod() {
    AdMob.createBanner({
      adId: admobConfig.banner,
      isTesting: true,
      overlap: false,
      position: AdMob.AD_POSITION.BOTTOM_CENTER
    }).then(() => {
      AdMob.hideBanner();
    });
    Network.onDisconnect().subscribe(() => {
      AdMob.hideBanner();
    });
    Network.onConnect().subscribe(() => {
      AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    });
  }

  openPage(page) {
    this.nav.setRoot(page);
  }
}
