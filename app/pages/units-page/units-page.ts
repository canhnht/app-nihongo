import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Popover, List} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {WordsPage} from '../words-page/words-page';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {CourseService} from '../../services/course.service';
import {LoaderService} from '../../services/loader.service';
import {WordSlides} from '../word-slides/word-slides';
import {Loader} from '../../components/loader/loader';

@Component({
  templateUrl: 'build/pages/units-page/units-page.html',
  directives: [AudioSetting],
})
export class UnitsPage {
  @ViewChild(List) list: List;
  private units: any[] = [];
  private course: any;
  private selectedUnits: number[] = [];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private courseService: CourseService, private loaderService: LoaderService) {
    this.course = this.navParams.data.selectedCourse;
    this.courseService.getCourse(this.course._id)
      .then(course => {
        this.course = course;
        this.units = this.course.units;
      });
  }

  ionViewWillEnter() {
    this.selectedUnits = [];
  }

  goToUnit($event, unit) {
    this.navController.push(WordsPage, { selectedUnit: unit });
    $event.stopPropagation();
  }

  downloadUnit($event, unit) {
    console.log('download', unit);
    unit.downloading = true;
    $event.stopPropagation();

    // set timeout for completing download
    setTimeout(() => {
      unit.downloading = false;
      unit.downloaded = true;
    }, 2000);
  }

  deleteUnit(unit) {
    unit.downloaded = false;
    this.list.closeSlidingItems();
  }

  checkUnit($event, unit) {
    let index: number = this.selectedUnits.indexOf(unit.number);
    if (index >= 0)
      this.selectedUnits.splice(index, 1);
    else
      this.selectedUnits.push(unit.number);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedUnits.length == this.units.length) {
      this.selectedUnits = [];
    } else {
      this.selectedUnits = [];
      this.units.forEach(unit => {
        this.selectedUnits.push(unit.number);
      });
    }
  }

  playSelectedList() {
    this.audioService.playListUnit(this.selectedUnits);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = 1;
    this.selectedUnits = [];
    this.navController.push(WordSlides);
  }

  continuePlaying() {
    this.audioService.playCurrentTrack();
    this.audioService.generateListWordOrder();
    if (this.audioService.playSingleWord)
      this.sliderService.currentSlide =
        this.audioService.listWordOrder.indexOf(this.audioService.singleWordIndex) + 1;
    this.navController.push(WordSlides);
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Download all', 'Delete all']
    });
    this.navController.present(popover, {
      ev: $event
    });
  }
}
