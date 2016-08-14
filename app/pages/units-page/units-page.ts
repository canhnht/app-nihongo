import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List, Alert} from 'ionic-angular';
import {Toast, Transfer, File, SpinnerDialog} from 'ionic-native';
import {WordsPage} from '../words-page/words-page';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {Subscription} from 'rxjs';
import {TranslateService} from 'ng2-translate/ng2-translate';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
  directives: [AudioSetting],
})
export class UnitsPage {
  @ViewChild(List) list: List;
  units: any[] = [];
  course: any = {};
  selectedUnits: any[] = [];
  currentCourseSubscription: Subscription;
  settingSubscription: Subscription;

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService) {
  }

  ionViewWillEnter() {
    this.dbService.getCourse(this.navParams.data.selectedCourseId)
      .then(course => {
        this.course = course;
        this.units = [...this.course.units];
      });
    this.currentCourseSubscription = this.dbService.currentCourseSubject.subscribe(
      course => {
        this.course = course;
        this.units = [...this.course.units];
      }
    );

    if (this.settingService.selectedType === SelectedType.Unit
      && this.settingService.status === SettingStatus.Playing)
      this.selectedUnits = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.Unit)
          this.selectedUnits = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.selectedUnits = [];
    this.settingService.reset();
  }

  goToUnit(unit) {
    if (!unit.downloaded) {
      let alert = Alert.create({
        title: this.translate.instant('Download_unit'),
        subTitle: this.translate.instant('Download_unit_message'),
        buttons: [this.translate.instant('OK')]
      });
      this.navController.present(alert);
    } else {
      this.navController.push(WordsPage, { selectedUnit: unit });
    }
  }

  downloadUnit($event, unit, unitIndex) {
    $event.stopPropagation();
    unit.downloading = true;
    let unitRef = firebase.database().ref(`${this.course._id}/units/${unit._id}`);
    let unitData;
    unitRef.once('value').then(snapshot => {
      unitData = snapshot.val();
      Object.assign(this.course.units[unitIndex], unitData);
      this.course.noWords += unitData.noWords;
      return this.dbService.updateCourse(this.course);
    }).then(() => {
      let storage = firebase.storage();
      let urlPromise = unitData.words.map(word => {
        let pathReference = storage.ref(`${this.course._id}/${unit._id}/${word.audioFile}.mp3`);
        return Promise.resolve(pathReference.getDownloadURL());
      });
      return Promise.all(urlPromise);
    }).then(listUrl => {
      let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/${this.course._id}/${unit._id}`;
      let downloadPromise = listUrl.map((url, index) => {
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(url,
          `${folderPath}/${unitData.words[index].audioFile}.mp3`));
      });
      return Promise.all(downloadPromise);
    }).then(res => {
      Toast.showLongCenter(`Unit ${unit.unitName} of course ${this.course.courseName} has been downloaded successfully`).subscribe(() => {});
      this.units[unitIndex].downloading = false;
      this.course.units[unitIndex].downloaded = true;
      this.course.units[unitIndex].words.forEach(word => {
        word.audioFile = `${this.course._id}/${unit._id}/${word.audioFile}.mp3`;
      });
      return this.dbService.updateCourse(this.course);
    })
    .catch(err => {
      this.units[unitIndex].downloading = false;
      Toast.showLongBottom('Error downloading').subscribe(() => {});
    });
  }

  deleteUnit(unit) {
    let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/${this.course._id}/`;
    File.removeRecursively(folderPath, unit._id).then(res => {
      Toast.showLongCenter(`Unit ${unit.unitName} of course ${this.course.courseName} has been deleted successfully`).subscribe(() => {});
    }).catch(err => {
      Toast.showLongBottom('Error deleting').subscribe(() => {});
    });

    this.course.units.some(item => {
      if (item.number === unit.number) {
        item.downloaded = false;
        this.course.noWords -= item.noWords;
        item.noWords = 0;
        item.words = [];
        return true;
      }
      return false;
    });
    this.dbService.updateCourse(this.course);
    this.list.closeSlidingItems();
  }

  checkUnit($event, unit) {
    $event.stopPropagation();
    this.settingService.addUnit(unit);
  }

  toggleSelectAll() {
    if (this.selectedUnits.length == this.units.length) {
      this.settingService.selectUnits([]);
    } else {
      this.settingService.selectUnits(this.units);
    }
  }

  goToWordSlides() {
    this.navController.push(WordSlides);
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: [this.translate.instant('Download_all'), this.translate.instant('Delete_all')]
    });
    this.navController.present(popover, {
      ev: $event
    });
  }
}
