import { Component } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, Network, OneSignal, File } from 'ionic-native';
import { Platform, App, NavController, AlertController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsPage } from '../news-page/news-page';
import { NewsDetail } from '../news-detail/news-detail';
import { UnitsPage } from '../units-page/units-page';
import { ModalDownloadPage } from '../modal-download-page/modal-download-page';
import { DbService, SettingService, DownloadService, LocalStorageService, LoaderService, AuthService } from '../../services';
import { AnalyticsService, Events, Params } from '../../services';
import { NHK_URL } from '../../helpers/constants';
import * as utils from '../../helpers/utils';
import { oneSignalConfig } from '../../app/config-local';

declare var cordova: any;
declare var require: any;
let firebase = require('firebase');

@Component({
  selector: 'tab-home-page',
  templateUrl: 'tab-home-page.html'
})
export class TabHomePage {
  courses: any[] = [];
  coursesSubscription: Subscription;
  settingSubscription: Subscription;
  listNewsSubscription: Subscription;
  downloadNewsSubscription: Subscription;
  latestNews: any = null;
  latestNewsSubscription: Subscription;
  loadingNews: boolean = false;
  modalDownloadCourse: any;
  initDbSubscription: Subscription;
  dataURI: string;

  constructor(private app: App, private navCtrl: NavController, private dbService: DbService,
    private settingService: SettingService, private http: Http, private storageService: LocalStorageService,
    private translate: TranslateService, private downloadService: DownloadService, private alertCtrl: AlertController,
    private modalCtrl: ModalController, private analytics: AnalyticsService, private loader: LoaderService,
    private authService: AuthService, private platform: Platform) {
    let initDbSubscription = this.dbService.initSubject.subscribe((init) => {
      initDbSubscription.unsubscribe();
      if (init) {
        this.downloadNews();
        this.loadData();
      }
    });

    this.platform.ready().then(() => {
      this.initializeOneSignal();
    });
  }

  private initializeOneSignal() {
    OneSignal.startInit(oneSignalConfig.appID, oneSignalConfig.googleProjectNumber)
      .inFocusDisplaying(OneSignal.OSInFocusDisplayOption.Notification)
      .handleNotificationOpened((jsonData) => {
        let course = jsonData.notification.payload.additionalData;
        course.free = course.free === 'true';
        let prompt = this.alertCtrl.create({
          title: this.translate.instant('Download_course'),
          subTitle: this.translate.instant('Confirm_download_course', {
            courseName: course.name
          }),
          buttons: [
            {
              text: this.translate.instant('Cancel'),
            },
            {
              text: this.translate.instant('OK'),
              handler: () => {
                this.getDisplayedCourse(course).then((course) =>{
                  this.checkBeforeDownload(course);
                });
              }
            }
          ]
        });
        prompt.present();
      }).endInit();
  }

  private getDisplayedCourse(course) {
    let searchedCourse = this.courses.find((item) => item.id === course.id);
    if (!searchedCourse) {
      return this.dbService.addOrUpdateCourses([ course ]).then(() => {
        return this.courses.find((item) => item.id === course.id);
      });
    } else {
      return Promise.resolve(searchedCourse);
    }
  }

  ionViewWillEnter() {
    this.storageService.get('init_db').then((res) => {
      if (res) {
        this.loadData();
      }
    });
    this.trackCourses();
  }

  private loadData() {
    this.dbService.getCourses();
    this.coursesSubscription = this.dbService.coursesSubject.subscribe(
      (courses) => {
        this.courses = courses;
        this.courses.forEach((item) => {
          if (!item.downloaded && item.noUnits > 0) {
            item.noUnits = 0;
            item.noWords = 0;
            this.dbService.resetErrorCourse(item)
              .then(() => File.removeRecursively(cordova.file.dataDirectory, item.id))
              .catch((err) => {});
          }
        });
      }
    );

    this.dbService.getLatestNews();
    this.latestNewsSubscription = this.dbService.latestNewsSubject.subscribe(
      (latestNews) => {
        this.latestNews = latestNews;
      }
    );
  }

  ionViewWillLeave() {
    this.coursesSubscription.unsubscribe();
    this.downloadNewsSubscription.unsubscribe();
    this.latestNewsSubscription.unsubscribe();
  }

  checkBeforeDownload(course) {
    if (course.downloaded) {
      this.goToCourse(course);
    } else {
      if (Network.type === 'none' || Network.type === 'unknown') {
        let alert = this.alertCtrl.create({
          title: this.translate.instant('Connect_internet'),
          subTitle: this.translate.instant('Turn_on_internet'),
          buttons: [this.translate.instant('OK')]
        });
        alert.present();
        return;
      }
      let promptDownload = this.alertCtrl.create({
        title: this.translate.instant('Download_course'),
        subTitle: this.translate.instant('Download_course_confirmation'),
        buttons: [
          {
            text: this.translate.instant('Cancel'),
          },
          {
            text: this.translate.instant('OK'),
            handler: () => {
              this.dbService.resetErrorCourse(course).then(() => {
                this.openModalDownload(course);
                return this.downloadService.downloadCourse(course);
              }).then(() => {
                Toast.showLongCenter(this.translate.instant('Download_course_successfully', {
                  courseName: course.name
                })).subscribe(() => {});
                this.analytics.logEvent(Events.DOWNLOAD_COURSE, {
                  [Params.COURSE_ID]: course.id,
                  [Params.COURSE_NAME]: course.name,
                  [Params.COURSE_LEVEL]: course.level
                });
                this.modalDownloadCourse.dismiss();
                this.downloadService.downloadedPercent = 0;
                this.dbService.getCourses();
                this.goToCourse(course);
              }).catch((err) => {
                Toast.showLongBottom(this.translate.instant('Error_download_course')).subscribe(() => {});
                this.modalDownloadCourse.dismiss();
                this.downloadService.downloadedPercent = 0;
                this.dbService.getCourses();
              });
            }
          }
        ]
      });
      promptDownload.present();
    }
  }

  private openModalDownload(course) {
    this.modalDownloadCourse = this.modalCtrl.create(ModalDownloadPage, { course: course });
    this.modalDownloadCourse.present();
  }

  private goToCourse(course) {
    this.analytics.logEvent(Events.VIEW_COURSE, {
      [Params.COURSE_ID]: course.id,
      [Params.COURSE_NAME]: course.name,
      [Params.COURSE_LEVEL]: course.level
    });
    this.authService.saveHistory(course);
    this.settingService.reset(true);
    this.app.getRootNav().push(UnitsPage, {selectedCourse: course});
  }

  goToDetail() {
    this.app.getRootNav().push(NewsDetail, { selectedNews: this.latestNews });
  }

  listAllNews() {
    this.analytics.logEvent(Events.VIEW_NEWS);
    this.loader.show();
    this.app.getRootNav().push(NewsPage);
  }

  downloadNews() {
    if (Network.type === 'none' || Network.type === 'unknown') return;

    this.analytics.logEvent(Events.DOWNLOAD_NEWS);
    this.loadingNews = true;
    let params: URLSearchParams = new URLSearchParams();
    let currentDate = new Date();
    params.set('fromDate', `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
    this.downloadNewsSubscription = this.http.get(NHK_URL, { search: params })
      .map((res) => res.json())
      .subscribe((listNews) => {
        this.loadingNews = false;
        this.dbService.addOrUpdateNews(listNews);
      }, (err) => {
        this.loadingNews = false;
        Toast.showShortBottom(this.translate.instant('Download_news_error')).subscribe(() => {});
      });
  }

  trackCourses() {
    firebase.database().ref('courses').on('value', (snapshot) => {
      let courses = snapshot.val();
      let listCourse = Object.keys(courses).map((courseId) => {
        let course = courses[courseId];
        delete course.units;
        course.id = courseId;
        return course;
      });
      let imagesPromise = listCourse.map((course) => this.downloadImage(course));
      Promise.all(imagesPromise).then((listCourse) => {
        return this.dbService.addOrUpdateCourses(listCourse);
      }).then(() => {
        if (listCourse.length !== this.courses.length)
          Toast.showLongBottom(this.translate.instant('Courses_updated')).subscribe(() => {});
      }).catch(utils.errorHandler(this.translate.instant('Error_update_courses')));
    });
  }

  private downloadImage(course) {
    return utils.downloadImageData(course.imageUrl).then((imageData) => {
      course.imageUrl = imageData;
      return course;
    });
  }
}

