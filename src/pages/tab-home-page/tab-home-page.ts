import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, File, SpinnerDialog } from 'ionic-native';
import { App, NavController, AlertController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NewsPage } from '../news-page/news-page';
import { NewsDetail } from '../news-detail/news-detail';
import { UnitsPage } from '../units-page/units-page';
import { ModalDownloadPage } from '../modal-download-page/modal-download-page';
import { DbService, SettingService, DownloadService, LocalStorageService } from '../../services';
import { NHK_URL } from '../../constants';
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
  initDbSubscription: Subscription;

  constructor(private app: App, private navCtrl: NavController, private dbService: DbService,
    private settingService: SettingService, private http: Http, private storageService: LocalStorageService,
    private translate: TranslateService, private downloadService: DownloadService, private alertCtrl: AlertController, public modalCtrl: ModalController) {
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

  checkBeforeDownload(course){
    if(course.downloaded) {
      this.goToCourse(course);
    }else{
      this.openModalDownload(course);
      this.downloadService.downloadCourse(course).then((rs) => {
          this.dbService.getCourses();
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
    this.app.getRootNav().push(UnitsPage, {selectedCourse: course});
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
    this.app.getRootNav().push(NewsDetail, { selectedNews: this.latestNews });
  }

  listAllNews() {
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.app.getRootNav().push(NewsPage);
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

