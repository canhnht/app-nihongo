import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {CourseService} from '../../services/course.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';

@Component({
  templateUrl: 'build/pages/words-page/words-page.html',
  directives: [AudioSetting],
})
export class WordsPage {
  unit: any;
  course: any;
  words: any[] = [];
  selectedWords: number[] = [];
  currentCourseSubscription: Subscription;
  playlistSubscription: Subscription;
  playlists: any[];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private courseService: CourseService) {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.courseService.currentCourse;
    let unitIndex = this.course.units.findIndex(unit => unit.number === this.unit.number);
    this.words = this.course.units[unitIndex].words;
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.playlistSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.course = this.courseService.currentCourse;
    let unitIndex = this.course.units.findIndex(unit => unit.number === this.unit.number);
    this.words = this.course.units[unitIndex].words;
    this.currentCourseSubscription = this.courseService.currentCourseSubject.subscribe(
      course => this.course = course
    );
    this.selectedWords = [];

    this.courseService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
      });
    this.playlistSubscription = this.courseService.playlistSubject.subscribe(
      playlist => {
        this.playlists = this.playlists.map(item => {
          if (item._id == playlist._id) return playlist;
          else return item;
        });
      }
    );
  }

  selectWord(word) {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    let wordIndex = this.words.findIndex(item => item.number == word.number);
    this.audioService.playWord(this.unit.number, wordIndex);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide =
      this.audioService.listWordOrder.indexOf(wordIndex) + 1;
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

  addToPlaylist($event, word) {
    let alert = Alert.create();
    alert.setTitle('Add word to');
    this.playlists.forEach((playlist, index) => {
      alert.addInput({
        type: 'checkbox',
        label: playlist.name,
        value: index + '',
        checked: playlist.listWordNumber.indexOf(word.number) >= 0
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        data = data.map(e => parseInt(e));
        data.forEach(index => {
          if (this.playlists[index].listWordNumber.indexOf(word.number) == -1)
            this.playlists[index].listWordNumber.push(word.number);
        });
        this.playlists.forEach((playlist, index) => {
          let searchIndex = playlist.listWordNumber.indexOf(word.number);
          if (searchIndex >= 0 && data.indexOf(index) == -1) {
            playlist.listWordNumber.splice(searchIndex, 1);
          }
        });
        this.courseService.updateMultiplePlaylists(this.playlists);
      }
    });
    this.navController.present(alert);
    // let modal = Modal.create(PlaylistOptions);
    // this.navController.present(modal);
    $event.stopPropagation();
  }

  toggleBookmark($event, word) {
    word.starred = !word.starred;
    this.course.units.forEach(unit => {
      unit.words.forEach(item => {
        if (item.number == word.number)
          item.starred = word.starred;
      });
    });
    this.courseService.updateCourse(this.course);
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
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    this.audioService.playListWord(this.selectedWords);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = 1;
    this.selectedWords = [];
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
}
