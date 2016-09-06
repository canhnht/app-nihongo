import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {TranslateService} from 'ng2-translate/ng2-translate';

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
    private settingService: SettingService, private translate: TranslateService) {
  }

  ionViewWillEnter() {
    this.playlist = this.navParams.data.selectedPlaylist;
    this.words = this.playlist.words;
    if (this.settingService.selectedType === this.playlist._id)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === this.playlist._id)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.settingSubscription.unsubscribe();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
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
    this.settingService.toggleWordInPlaylist(this.playlist._id, word);
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.settingService.selectWordsInPlaylist(this.playlist._id, []);
    } else {
      this.settingService.selectWordsInPlaylist(this.playlist._id, this.words);
    }
  }
}
