import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';

@Component({
  templateUrl: 'build/pages/playlist-detail/playlist-detail.html',
  directives: [AudioSetting],
})
export class PlaylistDetail {
  playlist: any;
  words: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;
  playlists: any[];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private settingService: SettingService) {
    this.playlist = this.navParams.data.selectedPlaylist;
    this.words = this.playlist.words;
  }

  ionViewWillEnter() {
    if (this.settingService.selectedType === SelectedType.WordInPlaylist
      && this.settingService.status === SettingStatus.Playing)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.WordInPlaylist)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.settingSubscription.unsubscribe();
    this.selectedWords = [];
    this.settingService.reset();
  }

  selectWord(word) {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    let wordIndex = this.words.findIndex(item => item._id === word._id);
    this.navController.push(WordSlides, {
      hideBookmark: true,
      playSingleWord: true,
      listWord: this.playlist.words,
      wordIndex: wordIndex
    });
  }

  checkWord($event, word) {
    $event.stopPropagation();
    this.settingService.toggleWordInPlaylist(word);
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.settingService.selectWordsInPlaylist([]);
    } else {
      this.settingService.selectWordsInPlaylist(this.words);
    }
  }

  goToWordSlides() {
    this.navController.push(WordSlides, { hideBookmark: true });
  }
}
