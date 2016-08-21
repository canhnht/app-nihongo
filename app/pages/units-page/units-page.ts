import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List, Alert} from 'ionic-angular';
import {Toast, Transfer, File, SpinnerDialog} from 'ionic-native';
import {WordsPage} from '../words-page/words-page';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
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
  directives: [AudioSetting, CustomCheckbox],
})
export class UnitsPage {
  @ViewChild(List) list: List;
  units: any[] = [];
  course: any = {};
  selectedUnits: any[] = [];
  currentCourseSubscription: Subscription;
  settingSubscription: Subscription;
  firstTime: boolean = true;

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
        if (this.firstTime) {
          this.firstTime = !this.firstTime;
          this.settingService.selectUnits(this.units);
        }
      });
    this.currentCourseSubscription = this.dbService.currentCourseSubject.subscribe(
      course => {
        this.course = course;
        this.units = [...this.course.units];
        if (this.firstTime) {
          this.firstTime = !this.firstTime;
          this.settingService.selectUnits(this.units);
        }
      }
    );

    if (this.settingService.selectedType === SelectedType.Unit
      && this.settingService.status === SettingStatus.Playing)
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
    this.settingService.reset();
  }

  goToUnit($event, unit) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.navController.push(WordsPage, { selectedUnit: unit });
  }

  checkUnit($event, unit) {
    this.settingService.toggleUnit(unit);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedUnits.length === this.units.length) {
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
