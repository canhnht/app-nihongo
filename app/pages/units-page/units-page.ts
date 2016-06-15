import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LIST_UNIT} from '../../data/list-unit.data';
import {LessonsPage} from '../lessons-page/lessons-page';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html'
})
export class UnitsPage {
  public units: any[];

  constructor(private navController: NavController) {
    this.units = LIST_UNIT;
  }

  selectUnit(unit) {
    this.navController.push(LessonsPage, {selectedUnit: unit});
  }
}
