import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {LIST_UNIT} from '../../providers/list-unit.data';
import {LessonsPage} from '../lessons-page/lessons-page';
import {Course} from '../../providers/course.interface';
import {Unit} from '../../providers/unit.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
  directives: [BottomAudioController],
})
export class UnitsPage {
  public units: Unit[] = LIST_UNIT;
  public course: Course;
  public selectedUnits: Unit[] = [];

  constructor(private _navController: NavController, private _navParams: NavParams) {
    this.course = _navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.selectedUnits = [];
  }

  selectUnit(unit) {
    this._navController.push(LessonsPage, {selectedUnit: unit});
  }

  playUnit($event, unit) {
    console.log('play', unit);
    $event.stopPropagation();
  }

  checkUnit($event, unit) {
    let index: number = this.selectedUnits.indexOf(unit.id);
    if (index >= 0)
      this.selectedUnits.splice(index, 1);
    else
      this.selectedUnits.push(unit.id);
    $event.stopPropagation();
  }

  uncheckAll() {
    this.selectedUnits = [];
  }
}
