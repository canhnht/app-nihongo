import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService, SettingService, LoaderService } from '../../services';
import { WordsPage } from '../words-page/words-page';
import { getRandomQuiz } from '../../helpers/main-helper';
import { UnitStatus } from '../../helpers/custom-types';

@Component({
  templateUrl: 'units-page.html'
})
export class UnitsPage {
  units: any[] = [];
  course: any = {};
  currentUnit: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService, private alertCtrl: AlertController, private translate: TranslateService,
    private settingService: SettingService, private loader: LoaderService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.loadUnitPage();
  }

  checkStatus(unit){
    if (this.isOpen(unit)) {
      let listUpdateUnits = this.units.filter((item) => item.id !== unit.id);
      let promiseUpdateUnit =  this.updateStateUnit(unit.id, UnitStatus.Current);
      let promiseUpdateListUnits = listUpdateUnits.map((unit) => {
        return this.updateStateUnit(unit.id, UnitStatus.Lock);
      });
      Promise.all(promiseUpdateListUnits.concat(promiseUpdateUnit)).then(() => {
        this.loadUnitPage();
      });
    } else if (this.isLock(unit)) {
      let alert = this.alertCtrl.create({
        title: this.translate.instant('Test'),
        subTitle: this.translate.instant('Test_before_new_unit'),
        buttons: [
          {
            text: this.translate.instant('Cancel'),
          },
          {
            text: this.translate.instant('OK'),
            handler: () => {
              this.loader.show();
              this.dbService.getWordsByUnitId(unit.id).then((words) => {
              this.navCtrl.push(getRandomQuiz(), {
                words,
                onFail: () => {},
                onPass: () => {
                  let promiseUpdateNewUnit = this.updateStateUnit(unit.id, UnitStatus.Current);
                  let promiseUpdateOldUnit = this.updateStateUnit(this.currentUnit.id, UnitStatus.Pass);
                  Promise.all([promiseUpdateNewUnit, promiseUpdateOldUnit]).then(() => {
                    this.loadUnitPage();
                    this.goToUnit(unit);
                  });
                },
              });
            });
            }
          }
        ]
      });
      alert.present();
    } else if (this.isPass(unit) || this.isCurrent(unit)) {
      this.goToUnit(unit);
    }
  }

  private loadUnitPage() {
    this.dbService.getUnitsByCourseId(this.course.id).then((units) => {
      this.units = units;
      this.currentUnit = units.find((item) => item.state == UnitStatus.Current);
      if (!this.currentUnit) {
        let alert = this.alertCtrl.create({
          title: this.translate.instant('Guide'),
          subTitle: this.translate.instant('Select_unit_to_start')
        });
        alert.present();
      }
    });
  }

  private updateStateUnit(unitId, state){
    let unit = {
      id : unitId,
      state: state
    }
    return this.dbService.updateStateOfUnit(unit);
  }

  private goToUnit(unit) {
    this.loader.show();
    this.settingService.reset(true);
    this.navCtrl.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: this.course,
    });
  }

  isPass(unit) {
    return unit.state == UnitStatus.Pass;
  }

  isCurrent(unit) {
    return unit.state == UnitStatus.Current;
  }

  isOpen(unit) {
    return unit.state == UnitStatus.Open;
  }

  isLock(unit) {
    return unit.state == UnitStatus.Lock;
  }
}
