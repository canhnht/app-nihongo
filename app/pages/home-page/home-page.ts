import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {Toast, Transfer, File} from 'ionic-native';
import {NavController, Popover, Alert, NavParams} from 'ionic-angular';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {UnitsPage} from '../units-page/units-page';
import {WordSlides} from '../word-slides/word-slides';
import {DbService} from '../../services/db.service';
import {SettingService} from '../../services/setting.service';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [AudioSetting, CustomCheckbox]
})
export class HomePage {
  courses: any[];
  listCourseSubscription: Subscription;
  tabPage: string;

  constructor(private navController: NavController, private dbService: DbService,
    private settingService: SettingService, private navParams: NavParams) {
    this.tabPage = this.navParams.data.tabPage || 'home';
  }

  ionViewWillEnter() {
    this.dbService.getListCourse().then(listCourse => this.courses = listCourse);
    this.settingService.reset(true);
    this.listCourseSubscription = this.dbService.listCourseSubject.subscribe(
      listCourse => this.courses = listCourse);
  }

  ionViewWillLeave() {
    this.listCourseSubscription.unsubscribe();
  }

  goToCourse(course) {
    this.navController.push(UnitsPage, {selectedCourseId: course._id});
  }

  deleteCourse(course) {
    let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/`;
    File.removeRecursively(folderPath, course._id).then(res => {
      Toast.showLongCenter(`Course ${course.courseName} has been deleted successfully`).subscribe(() => {});
    }).catch(err => {
      Toast.showLongBottom('Error deleting').subscribe(() => {});
    });

    course.units = [];
    course.noWords = 0;
    course.downloaded = false;
    this.dbService.updateCourse(course);
  }

  downloadCourse(course, index) {
    course.downloading = true;
    let courseRef = firebase.database().ref(`${course._id}`);
    let courseData;
    courseRef.once('value').then(snapshot => {
      snapshot = snapshot.val();
      courseData = Object.assign({}, snapshot);
      courseData.units = [];
      Object.keys(snapshot.units).forEach(unitId => {
        let unit = Object.assign({_id: unitId}, snapshot.units[unitId]);
        courseData.units.push(unit);
      });
      courseData.units = courseData.units.sort((u1, u2) => {
        return u1.number - u2.number;
      });
      Object.assign(course, courseData);
      return this.dbService.updateCourse(course);
    }).then(() => {
      let storage = firebase.storage();
      let urlPromise = courseData.units.reduce((res, unit) => {
        let listPromise = unit.words.map(word => {
          let pathReference = storage.ref(`${course._id}/${unit._id}/${word.audioFile}.mp3`);
          return Promise.resolve(pathReference.getDownloadURL()).then(url => ({
            url,
            unitId: unit._id,
            audioFile: word.audioFile,
          }));
        });
        return res.concat(listPromise);
      }, []);
      return Promise.all(urlPromise);
    }).then(listUrl => {
      let downloadPromise = listUrl.map(item => {
        let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/${course._id}/${item.unitId}`;
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(item.url,
          `${folderPath}/${item.audioFile}.mp3`));
      });
      return Promise.all(downloadPromise);
    }).then(res => {
      Toast.showLongCenter(`Course ${course.courseName} has been downloaded successfully`).subscribe(() => {});
      course = this.courses[index];
      course.downloading = false;
      course.downloaded = true;
      course.units.forEach(unit => {
        unit.words.forEach(word => {
          word.audioFile = `${course._id}/${unit._id}/${word.audioFile}.mp3`;
        });
      });
      return this.dbService.updateCourse(course);
    })
    .catch(err => {
      course.downloading = false;
      Toast.showLongBottom('Error downloading').subscribe(() => {});
    });
  }

  showAlert() {
    let alert = Alert.create({
      title: 'Sorry!',
      subTitle: 'This course is not available yet.',
      buttons: ['OK']
    });
    this.navController.present(alert);
  }

  buyCourse(course) {
    let confirm = Alert.create({
      title: `Buy course ${course.title}?`,
      message: 'Do you agree to buy this course? The transaction will be taken immediately.',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {}
        },
        {
          text: 'Agree',
          handler: () => {
            course.isFree = true;
          }
        }
      ]
    });
    this.navController.present(confirm);
  }

  getItems($event) {
    console.log('getItems', $event.value);
  }

  goToWordSlides() {
    this.navController.push(WordSlides);
  }
}
