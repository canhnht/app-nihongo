import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {CustomDatePipe} from '../../custom-date.pipe';

@Component({
  templateUrl: 'build/pages/words-page/words-page.html',
  directives: [AudioSetting, CustomCheckbox],
  pipes: [CustomDatePipe],
})
export class WordsPage {
  unit: any = {};
  course: any = {};
  words: any[] = [];
  searchedWords: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;
  currentCourseSubscription: Subscription;
  value: string = '';

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService) {
  }

  sortWordsByAnalytic() {
    this.words = this.words.sort((w1, w2) => {
      if (w1.lastPlayed && w2.lastPlayed && w1.lastPlayed !== w2.lastPlayed)
        return w2.lastPlayed - w1.lastPlayed;
      return w2.timesPlayed - w1.timesPlayed;
    });
  }

  ionViewWillEnter() {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.dbService.currentCourse;
    this.words = [...this.course.units[this.unit.unitIndex].words];
    this.sortWordsByAnalytic();
    this.searchedWords = this.words.filter(word => {
      return word.kanji.startsWith(this.value) || word.hira_kata.startsWith(this.value);
    });

    this.currentCourseSubscription = this.dbService.currentCourseSubject.subscribe(
      course => {
        this.course = course;
        this.unit = this.course.units[this.unit.unitIndex];
        this.words = [...this.unit.words];
        this.sortWordsByAnalytic();
        this.searchedWords = this.words.filter(word => {
          return word.kanji.startsWith(this.value) || word.hira_kata.startsWith(this.value);
        });
      }
    );

    if (this.settingService.selectedType === this.unit._id)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === this.unit._id)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    let wordIndex = this.words.findIndex(item => item._id === word._id);
    this.navController.push(WordSlides, {
      playSingleWord: true,
      listWord: this.unit.words,
      wordIndex: wordIndex
    });
  }

  checkWord($event, word) {
    this.settingService.toggleWordInUnit(this.unit._id, word);
    $event.stopPropagation();
  }

  addToPlaylist($event, word) {
    let modal = Modal.create(PlaylistOptions, { currentWord: word });
    modal.onDismiss(res => {
      if (!res) return;
      let data = res.data;
      let playlists = res.playlists;

      this.course.units[this.unit.unitIndex].words[word.wordIndex].bookmarked = data.length > 0;
      data = data.map(e => parseInt(e));
      data.forEach(index => {
        if (playlists[index].words.findIndex(e => e._id === word._id) === -1)
          playlists[index].words.push(word);
      });
      playlists.forEach((playlist, index) => {
        let searchIndex = playlist.words.findIndex(e => e._id === word._id);
        if (searchIndex >= 0 && data.indexOf(index) === -1) {
          playlist.words.splice(searchIndex, 1);
        }
      });
      this.dbService.updateMultiplePlaylists(playlists);
      this.dbService.updateCourse(this.course);
    });
    this.navController.present(modal);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.settingService.selectWordsInUnit(this.unit._id, []);
    } else {
      this.settingService.selectWordsInUnit(this.unit._id, this.words);
    }
  }

  search($event) {
    this.value = $event.value;
    this.searchedWords = this.words.filter(word => {
      return word.kanji.startsWith(this.value) || word.hira_kata.startsWith(this.value);
    });
  }
}
