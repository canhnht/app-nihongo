import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { SpinnerDialog } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AudioService, SliderService, DbService, SettingService } from '../../services';
// import {WordSlides} from '../word-slides/word-slides';
import { PlaylistOptions } from '../../components';

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
  currentCourseSubscription: Subscription;
  value: string = '';

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService,
    private dbService: DbService, private settingService: SettingService,
    private translate: TranslateService, private modalCtrl: ModalController) {
  }

  // sortWordsByAnalytic() {
  //   this.words = this.words.sort((w1, w2) => {
  //     if (w1.lastPlayed && w2.lastPlayed && w1.lastPlayed !== w2.lastPlayed)
  //       return w2.lastPlayed - w1.lastPlayed;
  //     return w2.timesPlayed - w1.timesPlayed;
  //   });
  // }

  ionViewWillEnter() {
    this.unit = this.navParams.data.selectedUnit;
    this.course = this.navParams.data.selectedCourse;
    this.dbService.getWordsByUnitId(this.unit.id).then((words) => {
      this.words = words;
      this.searchedWords = this.words.filter(word => {
        return word.kanji.startsWith(this.value);
      });
    });

    if (this.settingService.selectedType === this.unit.id)
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === this.unit.id)
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
    // let wordIndex = this.words.findIndex(item => item.id === word.id);
    // this.navController.push(WordSlides, {
    //   playSingleWord: true,
    //   listWord: this.words,
    //   wordIndex: wordIndex
    // });
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

  toggleSelectAll() {
    if (this.selectedWords.length === this.words.length) {
      this.settingService.selectWordsInUnit(this.unit.id, []);
    } else {
      this.settingService.selectWordsInUnit(this.unit.id, this.words);
    }
  }

  search($event) {
    this.value = $event.value;
    this.searchedWords = this.words.filter(word => {
      return word.kanji.startsWith(this.value);
    });
  }
}
