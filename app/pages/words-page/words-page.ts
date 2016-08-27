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
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/words-page/words-page.html',
  directives: [AudioSetting, CustomCheckbox],
})
export class WordsPage {
  unit: any = {};
  course: any = {};
  unitIndex: number;
  words: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;
  currentCourseSubscription: Subscription;

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService) {
  }

  ionViewWillEnter() {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.dbService.currentCourse;
    this.unitIndex = this.course.units.findIndex(e => e._id === this.unit._id);
    this.words = [...this.unit.words];

    this.currentCourseSubscription = this.dbService.currentCourseSubject.subscribe(
      course => {
        this.course = course;
        this.unit = this.course.units[this.unitIndex];
        this.words = [...this.unit.words];
      }
    );

    if (this.settingService.selectedType === SelectedType.WordInUnit
      && this.settingService.status === SettingStatus.Playing)
      this.selectedWords = this.settingService.selectedList;
    else this.selectedWords = [];
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.WordInUnit)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.settingService.reset();
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
    this.settingService.toggleWordInUnit(word);
    $event.stopPropagation();
  }

  addToPlaylist($event, word) {
    let wordIndex = this.words.findIndex(e => e._id === word._id);
    // let alert = Alert.create();
    // alert.setTitle(this.translate.instant('Add_word'));
    // this.playlists.forEach((playlist, index) => {
    //   alert.addInput({
    //     type: 'checkbox',
    //     label: playlist.name,
    //     value: index + '',
    //     checked: playlist.words.findIndex(e => e._id === word._id) >= 0
    //   });
    // });
    // alert.addButton(this.translate.instant('Cancel'));
    // alert.addButton({
    //   text: this.translate.instant('OK'),
    //   handler: data => {
    //     this.course.units[this.unitIndex].words[wordIndex].bookmarked = data.length > 0;
    //     data = data.map(e => parseInt(e));
    //     data.forEach(index => {
    //       if (this.playlists[index].words.findIndex(e => e._id === word._id) === -1)
    //         this.playlists[index].words.push(word);
    //     });
    //     this.playlists.forEach((playlist, index) => {
    //       let searchIndex = playlist.words.findIndex(e => e._id === word._id);
    //       if (searchIndex >= 0 && data.indexOf(index) === -1) {
    //         playlist.words.splice(searchIndex, 1);
    //       }
    //     });
    //     this.dbService.updateMultiplePlaylists(this.playlists);
    //     this.dbService.updateCourse(this.course);
    //   }
    // });
    // this.navController.present(alert);

    let modal = Modal.create(PlaylistOptions, { currentWord: word });
    modal.onDismiss(res => {
      alert('dismis ' + JSON.stringify(res));
      if (!res) return;
      let data = res.data;
      let playlists = res.playlists;

      this.course.units[this.unitIndex].words[wordIndex].bookmarked = data.length > 0;
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
      this.settingService.selectWordsInUnit([]);
    } else {
      this.settingService.selectWordsInUnit(this.words);
    }
  }

  getItem($event) {
    let value = $event.value;
  }
}
