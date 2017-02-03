import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, File, Network } from 'ionic-native';
import { App, NavController, AlertController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsPage } from '../news-page/news-page';
import { NewsDetail } from '../news-detail/news-detail';
import { UnitsPage } from '../units-page/units-page';
import { ModalDownloadPage } from '../modal-download-page/modal-download-page';
import { DbService, SettingService, DownloadService, LocalStorageService, LoaderService } from '../../services';
import { AnalyticsService, Events, Params } from '../../services';
import { NHK_URL } from '../../helpers/constants';
import * as utils from '../../helpers/utils';

declare var require: any;
let firebase = require('firebase');

@Component({
  selector: 'page-tab-home-page',
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
  loadingNews: boolean = true;
  modalDownloadCourse: any;
  initDbSubscription: Subscription;
  dataURI: string;

  constructor(private app: App, private navCtrl: NavController, private dbService: DbService,
    private settingService: SettingService, private http: Http, private storageService: LocalStorageService,
    private translate: TranslateService, private downloadService: DownloadService, private alertCtrl: AlertController,
    private modalCtrl: ModalController, private analytics: AnalyticsService, private loader: LoaderService) {
  }

  ionViewWillEnter() {
    this.storageService.get('init_db').then((res) => {
      if (res) {
        this.loadData();
      }
    });
    let initDbSubscription = this.dbService.initSubject.subscribe((init) => {
      initDbSubscription.unsubscribe();
      if (init) {
        this.loadData();
      }
    });
  }

  private loadData() {
    this.downloadNews();
    this.dbService.getCourses();
    this.coursesSubscription = this.dbService.coursesSubject.subscribe(
      (courses) => {
        this.courses = courses;
        this.courses.forEach((item) => {
          if (!item.downloaded && item.noUnits > 0) {
            item.downloaded = true;
            this.dbService.updateDownloadedCourse(item);
          }
        });
      }
    );

    this.dbService.getLatestNews();
    this.latestNewsSubscription = this.dbService.latestNewsSubject.subscribe(
      latestNews => this.latestNews = latestNews
    );
  }

  ionViewWillLeave() {
    this.coursesSubscription.unsubscribe();
    this.downloadNewsSubscription.unsubscribe();
    this.latestNewsSubscription.unsubscribe();
  }

  checkBeforeDownload(course) {
    if (this.downloadService.downloadingCourseId && this.downloadService.downloadingCourseId !== course.id) {
      let alert = this.alertCtrl.create({
        title: this.translate.instant('Download_course'),
        subTitle: this.translate.instant('Download_one_course_a_time')
      });
      alert.present();
      return;
    }
    if (course.downloaded) {
      this.goToCourse(course);
    } else if (course.downloading) {
      this.openModalDownload(course);
    } else {
      this.openModalDownload(course);
      course.downloading = true;
      this.downloadService.downloadCourse(course).then(() => {
        course.downloading = false;
        this.dbService.getCourses();
        this.modalDownloadCourse.dismiss();
        this.goToCourse(course);
      });
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
    this.analytics.logEvent(Events.DOWNLOAD_NEWS);
    if (Network.type === 'none' || Network.type === 'unknown') {
      Toast.showShortBottom(this.translate.instant('Download_news_error')).subscribe(() => {});
      return;
    }
    this.loadingNews = true;
    this.downloadNewsSubscription = this.http.get(NHK_URL)
      .map(res => res.json())
      .subscribe(listNews => {
        this.loadingNews = false;
        this.dbService.addOrUpdateNews(listNews);
      }, err => {
        this.loadingNews = false;
        Toast.showShortBottom(this.translate.instant('Download_news_error')).subscribe(() => {});
      });
  }

  refreshCourses(refresher) {
    this.analytics.logEvent(Events.DOWNLOAD_COURSE);
    if (Network.type === 'none' || Network.type === 'unknown' || this.downloadService.downloadingCourseId) {
      refresher.complete();
      return;
    }
    firebase.database().ref('courses').once('value').then((snapshot) => {
      let courses = snapshot.val();
      let listCourse = Object.keys(courses).map((courseId) => {
        let course = courses[courseId];
        delete course.units;
        course.id = courseId;
        return course;
      });
      let imagesPromise = listCourse.map((course) => this.downloadImage(course));
      return Promise.all(imagesPromise);
    }).then((listCourse) => {
      return this.dbService.addOrUpdateCourses(listCourse);
    }).then(() => {
      refresher.complete();
    }).catch((err) => {
      refresher.complete();
    });
  }

  private downloadImage(course) {
    return utils.downloadImageData(course.imageUrl).then((imageData) => {
      course.imageUrl = imageData;
      return course;
    });
  }
}

