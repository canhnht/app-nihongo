import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {LIST_UNIT} from '../../providers/list-unit.data';
import {VocabulariesPage} from '../vocabularies-page/vocabularies-page';
import {Course} from '../../providers/course.interface';
import {Unit} from '../../providers/unit.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
  directives: [BottomAudioController],
})
export class UnitsPage {
  private units: Unit[] = LIST_UNIT;
  private course: Course;
  private selectedUnits: number[] = [];

  constructor(private _navController: NavController, private _navParams: NavParams) {
    this.course = _navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.selectedUnits = [];
  }

  selectUnit(unit) {
    console.log('play', unit);
    unit.playing = true;
  }

  goToUnit($event, unit) {
    this._navController.push(VocabulariesPage, {selectedUnit: unit});
    $event.stopPropagation();
  }

  downloadUnit($event, unit) {
    console.log('download', unit);
    unit.downloading = true;
    $event.stopPropagation();
  }

  deleteUnit($event, unit) {
    console.log('delete', unit);
    unit.percentDownloaded = 0;
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

  playSelectedList() {
    this.selectedUnits.forEach(unitId => {
      let index: number = this.units.findIndex(unit => unit.id == unitId);
      if (index >= 0) {
        let unit: any = this.units[index];
        unit.playing = true;
      }
    })
    this.selectedUnits = [];
  }
}
