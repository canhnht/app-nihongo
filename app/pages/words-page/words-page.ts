import {Component} from '@angular/core';
import {NavController, NavParams, Popover} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {CourseService} from '../../services/course.service';
import {WordSlides} from '../word-slides/word-slides';

@Component({
  templateUrl: 'build/pages/words-page/words-page.html',
  directives: [AudioSetting],
})
export class WordsPage {
  private unit: any;
  private course: any;
  private words: any[] = [];
  private selectedWords: number[] = [];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private courseService: CourseService) {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.courseService.currentCourse;
    let unitIndex = this.course.units.findIndex(unit => unit.number === this.unit.number);
    this.words = this.course.units[unitIndex].words;
  }

  ionViewWillEnter() {
    this.selectedWords = [];
  }

  selectWord(word) {
    let wordIndex = this.words.findIndex(item => item.number == word.number);
    this.audioService.playWord(this.unit.number, wordIndex);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = wordIndex + 1;
    this.navController.push(WordSlides);
  }

  checkWord($event, word) {
    let index: number = this.selectedWords.indexOf(word.number);
    if (index >= 0)
      this.selectedWords.splice(index, 1);
    else
      this.selectedWords.push(word.number);
    $event.stopPropagation();
  }

  toggleBookmark($event, word) {
    word.starred = !word.starred;
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.selectedWords = [];
    } else {
      this.selectedWords = [];
      this.words.forEach(word => {
        this.selectedWords.push(word.number);
      });
    }
  }

  playSelectedList() {
    this.audioService.playListWord(this.selectedWords);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = 1;
    this.navController.push(WordSlides);
    this.selectedWords = [];
  }

  continuePlaying() {
    this.audioService.playCurrentTrack();
    this.navController.push(WordSlides);
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Setting']
    });
    this.navController.present(popover, {
      ev: $event
    });
  }
}
