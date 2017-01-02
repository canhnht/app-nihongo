import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from '../../services';
import { WordsPage } from '../words-page/words-page';

@Component({
  templateUrl: 'units-page.html',
})
export class UnitsPage {
  units: any[] = [];
  course: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.dbService.getUnitsByCourseId(this.course.id)
      .then(units => this.units = units);
  }

  goToUnit(unit) {
    this.navCtrl.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: this.course,
    });
  }
}
