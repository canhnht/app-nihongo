import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {Toast} from 'ionic-native';
import {NavController, Popover, Alert} from 'ionic-angular';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {UnitsPage} from '../units-page/units-page';
import {DbService} from '../../services/db.service';
import {SettingService} from '../../services/setting.service';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
})
export class HomePage {
  courses: any[];
  listCourseSubscription: Subscription;

  constructor(private navController: NavController, private dbService: DbService,
    private settingService: SettingService) {
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

  // downloadCourse(course) {
  //   course.downloading = true;
  //   let unitRef = firebase.database().ref(`${this.course._id}/units/${unit._id}`);
  //   let unitData;
  //   unitRef.once('value').then(snapshot => {
  //     unitData = snapshot.val();
  //     Object.assign(this.course.units[unitIndex], unitData);
  //     this.course.noWords += unitData.noWords;
  //     return this.dbService.updateCourse(this.course);
  //   }).then(() => {
  //     let storage = firebase.storage();
  //     let urlPromise = unitData.words.map(word => {
  //       let pathReference = storage.ref(`${this.course._id}/${unit._id}/${word.audioFile}.mp3`);
  //       return Promise.resolve(pathReference.getDownloadURL());
  //     });
  //     return Promise.all(urlPromise);
  //   }).then(listUrl => {
  //     let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/${this.course._id}/${unit._id}`;
  //     let downloadPromise = listUrl.map((url, index) => {
  //       const fileTransfer = new Transfer();
  //       return Promise.resolve(fileTransfer.download(url,
  //         `${folderPath}/${unitData.words[index].audioFile}.mp3`));
  //     });
  //     return Promise.all(downloadPromise);
  //   }).then(res => {
  //     Toast.showLongCenter(`Unit ${unit.unitName} of course ${this.course.courseName} has been downloaded successfully`).subscribe(() => {});
  //     this.units[unitIndex].downloading = false;
  //     this.course.units[unitIndex].downloaded = true;
  //     this.course.units[unitIndex].words.forEach(word => {
  //       word.audioFile = `${this.course._id}/${unit._id}/${word.audioFile}.mp3`;
  //     });
  //     return this.dbService.updateCourse(this.course);
  //   })
  //   .catch(err => {
  //     this.units[unitIndex].downloading = false;
  //     Toast.showLongBottom('Error downloading').subscribe(() => {});
  //   });
  // }

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
}
