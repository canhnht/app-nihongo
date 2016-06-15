import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Unit} from '../../data/unit.interface';

@Component({
  templateUrl: 'build/pages/lessons-page/lessons-page.html'
})
export class LessonsPage {

  private unit: Unit;

  constructor(private navController: NavController, private navParams: NavParams) {
    this.unit = this.navParams.data.selectedUnit;
    console.log(this.unit);
  }
}
