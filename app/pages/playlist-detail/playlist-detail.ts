import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';

@Component({
  templateUrl: 'build/pages/playlist-detail/playlist-detail.html',
  directives: [AudioSetting, CustomCheckbox],
})
export class PlaylistDetail {
  playlist: any = {};
  words: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private settingService: SettingService) {
  }

  ionViewWillEnter() {
    this.playlist = this.navParams.data.selectedPlaylist;
    this.words = this.playlist.words;
    if (this.settingService.selectedType === SelectedType.WordInPlaylist
      && this.settingService.status === SettingStatus.Playing)
      this.selectedWords = this.settingService.selectedList;
    else this.selectedWords = [];
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.WordInPlaylist)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.settingSubscription.unsubscribe();
    this.settingService.reset();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
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
