import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ModalController, NavParams } from 'ionic-angular';
import { SpinnerDialog, MediaPlugin } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PlaylistOptions } from '../../components';
import { AudioService, SliderService, DbService } from '../../services';

declare var cordova: any;

@Component({
  templateUrl: 'word-slides.html',
})
export class WordSlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };
  words: any[] = [];
  currentIndex: number = 0;
  trackIndexSubscription: Subscription;
  playlistSubscription: Subscription;
  playlists: any[];
  hideBookmark: boolean = false;
  hideAudioBar: boolean = false;
  playSingleWord: boolean = false;
  singleTrack: MediaPlugin = null;
  courses: any = {};
  allCoursesSubscription: Subscription;

  constructor(private navCtrl: NavController, private audioService: AudioService,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private modalCtrl: ModalController) {
    let params = this.navParams.data;
    this.hideBookmark = params.hideBookmark;
    if (params.playSingleWord) {
      this.playSingleWord = this.hideAudioBar = true;
      this.words = params.listWord;
      this.sliderOptions.initialSlide = params.wordIndex;
    } else {
      this.words = this.audioService.listWordOrder.map(
        wordIndex => this.audioService.listWord[wordIndex]
      );
      this.words = this.words.map((word) => Object.assign({ flipped: false }, word));
      if (this.sliderService.currentSlide >= 0)
        this.sliderOptions.initialSlide = this.sliderService.currentSlide - 1;
    }
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  ionViewWillEnter() {
    if (!this.playSingleWord)
      this.trackIndexSubscription = this.audioService.trackIndexSubject.subscribe(
        trackIndex => this.vocabSlider.slideTo(trackIndex + 1)
      );
  }

  ionViewWillLeave() {
    if (this.playSingleWord) return this.singleTrack.release();
    this.trackIndexSubscription.unsubscribe();
    this.audioService.stopCountDown();
    this.audioService.pauseCurrentTrack();
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  private getWordIndex(activeIndex: number) {
    if (activeIndex === 1 || activeIndex === this.words.length + 1) return 0;
    if (activeIndex === this.words.length || activeIndex === 0) return this.words.length - 1;
    return activeIndex - 1;
  }

  onSlideChanged($event) {
    if (this.playSingleWord) {
      this.currentIndex = this.getWordIndex($event.activeIndex);
      if (this.singleTrack) {
        this.singleTrack.release();
      }
      this.singleTrack = new MediaPlugin(`${cordova.file.dataDirectory}${this.words[this.currentIndex].audioFile}`);
      this.singleTrack.play();
      this.dbService.updateAnalytic(this.words[this.currentIndex]);
    } else {
      this.currentIndex = this.getWordIndex($event.activeIndex);
      if (this.sliderService.currentSlide < 0 && this.sliderService.firstTime)
        this.sliderService.currentSlide = $event.activeIndex;
      if (this.sliderService.firstTime) return this.sliderService.firstTime = false;
      this.sliderService.currentSlide = $event.activeIndex;
      let wordIndex: number = -1;
      let activeIndex = $event.activeIndex;
      if (activeIndex == 0 || activeIndex == this.words.length)
        wordIndex = this.words.length - 1;
      else if (activeIndex == 1 || activeIndex == this.words.length + 1)
        wordIndex = 0;
      else
        wordIndex = activeIndex - 1;
      this.audioService.seekToWord(wordIndex);
    }
  }

  repeatCurrentVocabulary($event) {
    $event.stopPropagation();
    if (this.playSingleWord) {
      this.singleTrack.seekTo(0);
      this.singleTrack.play();
    }
    else this.audioService.repeatCurrentTrack();
  }

  addToPlaylist($event) {
    $event.stopPropagation();
    let word = this.words[this.currentIndex];
    let modal = this.modalCtrl.create(PlaylistOptions, { currentWord: word });
    modal.onDidDismiss((res) => {
      if (!res) return;
      let { diffPlaylists, isBookmarked } = res;
      word.bookmarked = isBookmarked;
      this.dbService.updateWordPlaylist(word.id, diffPlaylists);
    });
    modal.present();
  }

  closeSlide() {
    this.navCtrl.pop();
  }

  flipCard(word) {
    word.flipped = !word.flipped;
  }
}
