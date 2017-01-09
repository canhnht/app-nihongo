import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, Transfer, File, Network } from 'ionic-native';
import { App, NavController, AlertController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsPage } from '../news-page/news-page';
import { NewsDetail } from '../news-detail/news-detail';
import { UnitsPage } from '../units-page/units-page';
import { UnitsTmpPage } from '../units-tmp/units-tmp';
import { ModalDownloadPage } from '../modal-download-page/modal-download-page';
import { DbService, SettingService, DownloadService } from '../../services';
import { NHK_URL } from '../../constants';
declare var require: any;
let firebase = require('firebase');
import * as utils from '../../utils';

declare var cordova: any;

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
  
 
  constructor(private app: App, private navCtrl: NavController, private dbService: DbService,
    private settingService: SettingService, private http: Http,
    private translate: TranslateService, private downloadService: DownloadService, private alertCtrl: AlertController, public modalCtrl: ModalController) {
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

  checkBeforeDownload(course, index){
    if(course.downloaded) {
      this.goToCourse(course);
    }else{
      this.openModalDownload(course); 
      this.downloadService.downloadCourse(course, index).then((rs) => {
          this.modalDownloadCourse.dismiss();
          this.goToCourse(course);
      });    
    }
  }

  private openModalDownload(course) {
    this.modalDownloadCourse = this.modalCtrl.create(ModalDownloadPage, {course: course});
    this.modalDownloadCourse.present();
  }

  private goToCourse(course) {
    this.settingService.reset(true);
    this.app.getRootNav().push(UnitsTmpPage, { selectedCourse: course });
  }

  deleteCourse(course) {
    let folderPath = cordova.file.dataDirectory;
    File.removeRecursively(folderPath, course.id).then(res => {
      Toast.showLongCenter(this.translate.instant('Delete_course_successfully', {
        courseName: course.courseName
      })).subscribe(() => {});
    }).catch(utils.errorHandler(this.translate.instant('Error_delete_course')));

    this.dbService.deleteCourse(course);
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

