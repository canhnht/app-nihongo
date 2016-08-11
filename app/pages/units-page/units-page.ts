import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List, Alert} from 'ionic-angular';
import {Toast, Transfer, File, SpinnerDialog} from 'ionic-native';
import {WordsPage} from '../words-page/words-page';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {SettingService, SelectedType} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {Subscription} from 'rxjs';

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
    private dbService: DbService, private settingService: SettingService) {
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

    if (this.settingService.selectedType === SelectedType.Unit)
      this.selectedUnits = this.settingService.selectedList;
    else this.selectedUnits = [];
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
  }

  goToUnit(unit) {
    if (!unit.downloaded) {
      let alert = Alert.create({
        title: 'Download unit',
        subTitle: 'You need to download this unit before proceeding.',
        buttons: ['OK']
      });
      this.navController.present(alert);
    } else {
      this.navController.push(WordsPage, { selectedUnit: unit });
    }
  }

  downloadUnit($event, unit) {
    unit.downloading = true;
    let audioFiles = ['audio1.mp3', 'audio2.mp3', 'audio3.mp3'];
    let audioPromises = audioFiles.map(audio => {
      const fileTransfer = new Transfer();
      return Promise.resolve(fileTransfer.download(
        `https://s3-ap-southeast-1.amazonaws.com/app-nihongo/${audio}`,
        `file:///storage/emulated/0/Android/data/io.techybrain.app_nihongo/files/${audio}`));
    });
    Promise.all(audioPromises)
      .then(resp => {
        unit.downloading = false;
        this.course.units.some(item => {
          if (item.number == unit.number) {
            item.downloaded = true;
            return true;
          }
          return false;
        });
        this.dbService.updateCourse(this.course);
        Toast.showLongTop(`${JSON.stringify(resp)}`).subscribe(() => {});
      })
      .catch(err => {
        unit.downloading = false;
        Toast.showLongBottom(`Error ${JSON.stringify(err)}`).subscribe(() => {});
      });
    $event.stopPropagation();
  }

  deleteUnit(unit) {
    let audioFiles = ['audio1.mp3', 'audio2.mp3', 'audio3.mp3'];
    let audioPromises = audioFiles.map(audio => {
      return Promise.resolve(File.removeFile(
        'file:///storage/emulated/0/Android/data/io.techybrain.app_nihongo/files/', audio
      ));
    })
    Promise.all(audioPromises)
      .then(resp => {
        Toast.showLongTop(`${JSON.stringify(resp)}`).subscribe(() => {});
      })
      .catch(err => {
        Toast.showLongBottom(`Error DEL ${JSON.stringify(err)}`).subscribe(() => {});
      });
    this.course.units.some(item => {
      if (item.number === unit.number) {
        item.downloaded = false;
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

  playSelectedList() {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    this.audioService.playSetting();
    this.sliderService.resetSlider();
    this.navController.push(WordSlides);
  }

  continuePlaying() {
    this.audioService.playCurrentTrack();
    this.audioService.generateListWordOrder();
    if (this.audioService.playSingleWord)
      this.sliderService.currentSlide =
        this.audioService.listWordOrder.indexOf(this.audioService.singleWordIndex) + 1;
    this.navController.push(WordSlides);
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Download all', 'Delete all']
    });
    this.navController.present(popover, {
      ev: $event
    });
  }
}
