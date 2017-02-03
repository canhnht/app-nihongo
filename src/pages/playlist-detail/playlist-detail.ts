import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AudioService, SliderService, DbService, SettingService, LoaderService } from '../../services';
import { WordSlides } from '../word-slides/word-slides';

@Component({
  templateUrl: 'playlist-detail.html',
})
export class PlaylistDetail {
  playlist: any = {};
  words: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;
  currentPlaylistSubscription: Subscription;

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private settingService: SettingService, private translate: TranslateService,
    private dbService: DbService, private loader: LoaderService) {
    this.playlist = this.navParams.data.selectedPlaylist;
  }

  ionViewWillEnter() {
    this.dbService.getWordsByPlaylistId(this.playlist.id).then((words) => {
      this.words = words;
    });

    if (this.settingService.selectedType === this.playlist.id)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === this.playlist.id)
          this.selectedWords = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.settingSubscription.unsubscribe();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.loader.show();
    let wordIndex = this.words.findIndex(item => item.id === word.id);
    this.navCtrl.push(WordSlides, {
      hideBookmark: true,
      playSingleWord: true,
      listWord: this.words,
      wordIndex: wordIndex
    });
  }

  checkWord($event, word) {
    $event.stopPropagation();
    this.settingService.toggleWordInPlaylist(this.playlist.id, word);
  }

  toggleSelectAll() {
    if (this.selectedWords.length === this.words.length) {
      this.settingService.selectWordsInPlaylist(this.playlist.id, []);
    } else {
      this.settingService.selectWordsInPlaylist(this.playlist.id, this.words);
    }
  }

  deleteWord(word) {
    let wordIndex = this.playlist.words.findIndex(item => item.id === word.id);
    this.playlist.words.splice(wordIndex, 1);
    this.dbService.deleteWordPlaylist(word.id, this.playlist.id);
  }
}
