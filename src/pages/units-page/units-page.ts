import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SpinnerDialog } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService } from '../../services';
import { WordsPage } from '../words-page/words-page';
import { MultipleChoiceSlides } from '../multiple-choice-slides/multiple-choice-slides';

@Component({
  templateUrl: 'units-page.html',
})
export class UnitsPage {
  units: any[] = [];
  course: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService, private translate: TranslateService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.dbService.getUnitsByCourseId(this.course.id)
      .then(units => this.units = units);
  }

  goToUnit(unit) {
    // this.navCtrl.push(WordsPage, {
    //   selectedUnit: unit,
    //   selectedCourse: this.course,
    // });
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.dbService.getWordsByUnitId(unit.id).then((words) => {
      this.navCtrl.push(MultipleChoiceSlides, {
        words,
        onFail: () => {
          alert(`onFail`);
          this.navCtrl.push(WordsPage, {
            selectedUnit: unit,
            selectedCourse: this.course,
          });
        },
        onPass: () => {
          alert(`onPass`);
          this.navCtrl.push(WordsPage, {
            selectedUnit: unit,
            selectedCourse: this.course,
          });
        },
      });
    })
  }
}
