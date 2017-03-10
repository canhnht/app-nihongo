import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AudioService, SliderService, DbService, SettingService, LoaderService, LocalStorageService } from '../../services';
import { WordSlides } from '../word-slides/word-slides';
import { PlaylistOptions, SettingWord } from '../../components';
import * as utils from '../../helpers/utils';

declare var cordova: any;

@Component({
  templateUrl: 'words-page.html',
})
export class WordsPage {
  course: any = {};
  unit: any = {};
  words: any[] = [];
  searchedWords: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;

  value: string = '';
  displayHiragana: boolean;
  displayMeaning: boolean;
  track: MediaPlugin = null;
  playingWordId: string = null;

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService, private modalCtrl: ModalController,
    private loader: LoaderService, private storageService: LocalStorageService) {
  }

  ionViewWillEnter() {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.navParams.data.selectedCourse;
    this.dbService.getWordsByUnitId(this.unit.id).then((words) => {
      this.words = words;
      this.searchedWords = this.filterWords(this.words, this.value);
    });

    if (this.settingService.selectedType === this.unit.id)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === this.unit.id)
          this.selectedWords = setting.selectedList;
      }
    );

    this.storageService.get('display_mode').then((res) => {
      this.displayHiragana = res.indexOf('hiragana') >= 0;
      this.displayMeaning = res.indexOf('meaning') >= 0;
    });
  }

  ionViewDidEnter() {
    this.loader.hide();
  }

  ionViewWillLeave() {
    if (this.track) {
      this.track.release();
      this.track = null;
    }
    this.settingSubscription.unsubscribe();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.loader.show();
    let wordIndex = this.words.findIndex(item => item.id === word.id);
    this.navCtrl.push(WordSlides, {
      playSingleWord: true,
      listWord: this.words,
      wordIndex: wordIndex
    });
  }

  checkWord($event, word) {
    this.settingService.toggleWordInUnit(this.unit.id, word);
    $event.stopPropagation();
  }

  addToPlaylist($event, word) {
    $event.stopPropagation();
    let modal = this.modalCtrl.create(PlaylistOptions, { currentWord: word });
    modal.onDidDismiss((res) => {
      if (!res) return;
      let { diffPlaylists, isBookmarked } = res;
      word.bookmarked = isBookmarked;
      this.dbService.updateWordPlaylist(word.id, diffPlaylists);
    });
    modal.present();
  }

  playWord($event, word) {
    $event.stopPropagation();
    alert(word.audioFile);
    if (this.playingWordId === word.id) {
      this.track.stop();
      this.track.play();
    } else {
      this.playingWordId = word.id;
      if (this.track) this.track.release();
      utils.resolveIntervalUrl(`${cordova.file.dataDirectory}${word.audioFolder}`, word.audioFile)
        .then((url) => {
          this.track = new MediaPlugin(url);
          this.track.play();
        });
    }
  }

  openSettings() {
    let modal = this.modalCtrl.create(SettingWord);
    modal.onDidDismiss(() => {
      this.storageService.get('display_mode').then((res) => {
        this.displayHiragana = res.indexOf('hiragana') >= 0;
        this.displayMeaning = res.indexOf('meaning') >= 0;
      });
    });
    modal.present();
  }

  toggleSelectAll() {
    if (this.selectedWords.length === this.words.length) {
      this.settingService.selectWordsInUnit(this.unit.id, []);
    } else {
      this.settingService.selectWordsInUnit(this.unit.id, this.words);
    }
  }

  search($event) {
    this.value = $event.target.value;
    this.searchedWords = this.filterWords(this.words, this.value);
  }

  private filterWords(words, value) {
    return words.filter((word) => {
      let ok = (word.kanji.indexOf(value) !== -1);
      word.phonetic.forEach((e) => {
        ok = ok || (e.indexOf(value) !== -1);
      });
      return ok;
    });
  }
}
