import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';

@Component({
  templateUrl: 'build/pages/words-page/words-page.html',
  directives: [AudioSetting],
})
export class WordsPage {
  unit: any = {};
  course: any = {};
  words: any[] = [];
  selectedWords: any[] = [];
  playlistSubscription: Subscription;
  settingSubscription: Subscription;
  playlists: any[];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService) {
  }

  ionViewWillEnter() {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.dbService.currentCourse;
    this.words = [...this.unit.words];

    this.dbService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
      });
    this.playlistSubscription = this.dbService.playlistSubject.subscribe(
      playlist => {
        this.playlists = this.playlists.map(item => {
          if (item._id === playlist._id) return playlist;
          else return item;
        });
      }
    );

    if (this.settingService.selectedType === SelectedType.WordInUnit
      && this.settingService.status === SettingStatus.Playing)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.WordInUnit)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.playlistSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.selectedWords = [];
    this.settingService.reset();
  }

  selectWord(word) {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    let wordIndex = this.words.findIndex(item => item._id === word._id);
    this.navController.push(WordSlides, {
      playSingleWord: true,
      listWord: this.unit.words,
      wordIndex: wordIndex
    });
  }

  checkWord($event, word) {
    $event.stopPropagation();
    this.settingService.addWordInUnit(word);
  }

  addToPlaylist($event, word) {
    $event.stopPropagation();
    let alert = Alert.create();
    alert.setTitle('Add word to');
    this.playlists.forEach((playlist, index) => {
      alert.addInput({
        type: 'checkbox',
        label: playlist.name,
        value: index + '',
        checked: playlist.words.findIndex(e => e._id === word._id) >= 0
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        data = data.map(e => parseInt(e));
        data.forEach(index => {
          if (this.playlists[index].words.findIndex(e => e._id === word._id) === -1)
            this.playlists[index].words.push(word);
        });
        this.playlists.forEach((playlist, index) => {
          let searchIndex = playlist.words.findIndex(e => e._id === word._id);
          if (searchIndex >= 0 && data.indexOf(index) === -1) {
            playlist.words.splice(searchIndex, 1);
          }
        });
        this.dbService.updateMultiplePlaylists(this.playlists);
      }
    });
    this.navController.present(alert);
    // let modal = Modal.create(PlaylistOptions);
    // this.navController.present(modal);
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.settingService.selectWordsInUnit([]);
    } else {
      this.settingService.selectWordsInUnit(this.words);
    }
  }

  goToWordSlides() {
    this.navController.push(WordSlides);
  }
}
