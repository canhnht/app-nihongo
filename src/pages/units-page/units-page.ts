import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SpinnerDialog } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService, SettingService } from '../../services';
import { WordsPage } from '../words-page/words-page';
import { getRandomQuiz } from '../../helpers/main-helper';

@Component({
  templateUrl: 'units-page.html',
})
export class UnitsPage {
  units: any[] = [];
  course: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService, private translate: TranslateService,
    private settingService: SettingService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.dbService.getUnitsByCourseId(this.course.id)
      .then(units => this.units = units);
  }

  goToUnit(unit) {
    // SpinnerDialog.show(this.translate.instant('Processing'),
    //   this.translate.instant('Please_wait'), false);
    // this.dbService.getWordsByUnitId(unit.id).then((words) => {
    //   this.navCtrl.push(getRandomQuiz(), {
    //     words,
    //     onFail: () => {
    //       alert(`onFail`);
    //       this.displayWordsPage();
    //     },
    //     onPass: () => {
    //       alert(`onPass`);
    //       this.displayWordsPage();
    //     },
    //   });
    // });
    this.displayWordsPage(unit);
  }

  displayWordsPage(unit) {
    this.settingService.reset(true);
    this.navCtrl.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: this.course,
    });
  }
}
