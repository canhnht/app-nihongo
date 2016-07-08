import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List} from 'ionic-angular';
import {LIST_UNIT} from '../../providers/list-unit.data';
import {VocabulariesPage} from '../vocabularies-page/vocabularies-page';
import {Course} from '../../providers/course.interface';
import {Unit} from '../../providers/unit.interface';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../providers/audio.service';
import {SliderService} from '../../providers/slider.service';
import {VocabularySlides} from '../vocabulary-slides/vocabulary-slides';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
  directives: [AudioSetting],
})
export class UnitsPage {
  @ViewChild(List) list: List;
  private units: Unit[] = LIST_UNIT;
  private course: Course;
  private selectedUnits: number[] = [];

  constructor(private _navController: NavController, private _navParams: NavParams,
    private _audioService: AudioService, private sliderService: SliderService) {
    this.course = _navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.selectedUnits = [];
  }

  goToUnit($event, unit) {
    this._navController.push(VocabulariesPage, {selectedUnit: unit});
    $event.stopPropagation();
  }

  downloadUnit($event, unit) {
    console.log('download', unit);
    unit.downloading = true;
    $event.stopPropagation();

    // set timeout for completing download
    setTimeout(() => {
      unit.downloading = false;
      unit.percentDownloaded = 100;
    }, 2000);
  }

  deleteUnit(unit) {
    console.log('delete', unit);
    unit.percentDownloaded = 0;
    this.list.closeSlidingItems();
  }

  checkUnit($event, unit) {
    let index: number = this.selectedUnits.indexOf(unit.id);
    if (index >= 0)
      this.selectedUnits.splice(index, 1);
    else
      this.selectedUnits.push(unit.id);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedUnits.length == this.units.length) {
      this.selectedUnits = [];
    } else {
      this.selectedUnits = [];
      this.units.forEach(unit => {
        this.selectedUnits.push(unit.id);
      });
    }
  }

  playSelectedList() {
    this._audioService.playListUnit(this.selectedUnits);
    this.sliderService.resetSlider();
    this._navController.push(VocabularySlides,
      {title: 'Course 2 - Unit 3'});
    this.selectedUnits = [];
  }

  goToSlides() {
    this.sliderService.resetSlider();
    if (this._audioService.isPlaying) {
      this._navController.push(VocabularySlides,
        {title: 'Course 2 - Unit 3'});
    }
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Download all', 'Delete all', 'Setting']
    });
    this._navController.present(popover, {
      ev: $event
    });
  }
}
