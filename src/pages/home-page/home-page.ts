import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, Transfer, File, Network } from 'ionic-native';
import { NavController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsPage } from '../news-page/news-page';
import { NewsDetail } from '../news-detail/news-detail';
import { UnitsPage } from '../units-page/units-page';
import { DbService, SettingService } from '../../services';
import { NHK_URL } from '../../constants';

declare var require: any;
let firebase = require('firebase');
import * as utils from '../../utils';

declare var cordova: any;

@Component({
  templateUrl: 'home-page.html',
})
export class HomePage {
  courses: any[] = [];
  coursesSubscription: Subscription;
  settingSubscription: Subscription;
  listNewsSubscription: Subscription;
  downloadNewsSubscription: Subscription;
  latestNews: any = null;
  latestNewsSubscription: Subscription;
  loadingNews: boolean = true;

  constructor(private navCtrl: NavController, private dbService: DbService,
    private settingService: SettingService, private http: Http,
    private translate: TranslateService, private alertCtrl: AlertController) {
    this.downloadNews();
  }

  ionViewWillEnter() {
    this.dbService.getCourses();
    this.coursesSubscription = this.dbService.coursesSubject.subscribe(
      courses => this.courses = courses
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

  goToCourse(course) {
    this.settingService.reset(true);
    this.navCtrl.push(UnitsPage, { selectedCourse: course });
  }

  deleteCourse(course) {
    let folderPath = cordova.file.dataDirectory;
    File.removeRecursively(folderPath, course.id).then(res => {
      Toast.showLongCenter(this.translate.instant('Delete_course_successfully', {
        courseName: course.name
      })).subscribe(() => {});
    }).catch(utils.errorHandler(this.translate.instant('Error_delete_course')));

    this.dbService.deleteCourse(course.id);
  }

  goToDetail() {
    this.navCtrl.push(NewsDetail, { selectedNews: this.latestNews });
  }

  listAllNews() {
    this.navCtrl.push(NewsPage);
  }

  downloadNews() {
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
}
