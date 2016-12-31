import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { Toast, Transfer, File, Network } from 'ionic-native';
import { NavController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
// import {UnitsPage} from '../units-page/units-page';
// import {WordSlides} from '../word-slides/word-slides';
// import {NewsPage} from '../news-page/news-page';
// import {NewsDetail} from '../news-detail/news-detail';
import { DbService, SettingService } from '../../services';
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

    this.dbService.getLatestNews().then(latestNews => this.latestNews = latestNews);
    // this.listNewsSubscription = this.dbService.listNewsSubject.subscribe(
    //   listNews => this.latestNews = listNews[0]
    // );
  }

  ionViewWillLeave() {
    this.coursesSubscription.unsubscribe();
    this.downloadNewsSubscription.unsubscribe();
  }

  goToCourse(course) {
    this.settingService.reset(true);
    // this.navCtrl.push(UnitsPage, {selectedCourseId: course.id});
  }

  deleteCourse(course) {
    let folderPath = cordova.file.dataDirectory;
    alert(`deleteCourse ${folderPath}`);
    File.removeRecursively(folderPath, course.id).then(res => {
      Toast.showLongCenter(this.translate.instant('Delete_course_successfully', {
        courseName: course.courseName
      })).subscribe(() => {});
    }).catch(utils.errorHandler(this.translate.instant('Error_delete_course')));

    this.dbService.deleteCourse(course);
  }

  downloadCourse(course, index) {
    if (Network.connection === 'none' || Network.connection === 'unknown') {
      let alert = this.alertCtrl.create({
        title: 'Kết nối internet',
        subTitle: 'Hãy bật kết nối internet để bắt đầu tải khóa học!',
        buttons: ['Đồng ý']
      });
      alert.present();
      return;
    }
    course.downloading = true;
    let courseRef = firebase.database().ref(`${course.id}`);
    courseRef.once('value').then(snapshot => {
      snapshot = snapshot.val();
      let downloadPromise = Object.keys(snapshot.units).map(unitId => {
        let unit = {
          id: unitId,
          name: snapshot.units[unitId].unitName,
          number: snapshot.units[unitId].number,
          noWords: snapshot.units[unitId].noWords,
          locked: 1,
          courseId: course.id,
        };

        let words = snapshot.units[unitId].words;
        words.forEach((word) => {
          word.id = word._id;
          delete word._id;
          word.mainExample = JSON.stringify(word.mainExample);
          word.meaning = JSON.stringify(word.meaning);
          word.otherExamples = JSON.stringify(word.otherExamples);
          word.phonetic = JSON.stringify(word.phonetic);
        })

        let unitAndWordsPromise = this.dbService.addUnit(unit).then(() => {
          return this.dbService.addWords(words, unitId);
        });
        let audioPromise = this.downloadAudio(course.id, unitId, words);
        return Promise.all([unitAndWordsPromise, audioPromise]);
      });
      return Promise.all(downloadPromise);
    }).then(res => {
      Toast.showLongCenter(this.translate.instant('Download_course_successfully', {
        courseName: course.name
      })).subscribe(() => {});
      // course = this.courses[index];
      course.downloading = false;
      // course.downloaded = true;
      // course.units.forEach(unit => {
      //   unit.words.forEach(word => {
      //     word.audioFile = `${course._id}/${unit._id}/${word.audioFile}.mp3`;
      //   });
      // });
      // return this.dbService.updateCourse(course);
    })
    .catch(err => {
      course.downloading = false;
      Toast.showLongBottom(this.translate.instant('Error_download_course')).subscribe(() => {});
    });
  }

  private downloadAudio(courseId, unitId, words) {
    let storage = firebase.storage();
    words = words.filter((word) => !!word.audioFile);
    let urlsPromise = words.map(word => {
      let pathReference = storage.ref(`${courseId}/${unitId}/${word.audioFile}.mp3`);
      return Promise.resolve(pathReference.getDownloadURL()).then(url => ({
        url,
        unitId: unitId,
        audioFile: word.audioFile,
      }));
    });
    return Promise.all(urlsPromise).then((listUrl) => {
      let downloadPromise = listUrl.map((item: any) => {
        let folderPath = `${cordova.file.dataDirectory}/${courseId}/${unitId}`;
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(item.url,
          `${folderPath}/${item.audioFile}.mp3`));
      });
      return Promise.all(downloadPromise);
    });
  }

  goToDetail() {
    // this.navCtrl.push(NewsDetail, { selectedNews: this.latestNews });
  }

  listAllNews() {
    // this.navCtrl.push(NewsPage);
  }

  downloadNews() {
    this.loadingNews = true;
    this.downloadNewsSubscription = this.http.get('http://52.32.158.240/nihongo/nhk')
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
