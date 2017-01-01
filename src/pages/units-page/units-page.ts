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

  constructor(private navController: NavController, private navParams: NavParams,
    private dbService: DbService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.dbService.getUnitsByCourseId(this.course.id)
      .then(units => this.units = units);
  }

  goToUnit($event, unit) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.navController.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: course,
    });
  }
}
