import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List, Alert} from 'ionic-angular';
import {Toast, Transfer, File, SpinnerDialog} from 'ionic-native';
import {DbService} from '../../services/db.service';
import {WordsPage} from '../words-page/words-page';
import {Subscription} from 'rxjs';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
})
export class UnitsPage {
  units: any[] = [];
  course: any = {};

  constructor(private navController: NavController, private navParams: NavParams,
    private dbService: DbService, private translate: TranslateService) {
  }

  ionViewWillEnter() {
    this.dbService.getCourse(this.navParams.data.selectedCourseId)
      .then(course => {
        this.course = course;
        this.units = [...this.course.units];
      });
  }

  goToUnit($event, unit) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.navController.push(WordsPage, { selectedUnit: unit });
  }
}
