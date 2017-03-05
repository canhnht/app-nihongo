import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ModalController, NavParams } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PlaylistOptions } from '../../components';
import { AudioService, SliderService, DbService, LoaderService } from '../../services';
import * as utils from '../../helpers/utils';

declare var cordova: any;

@Component({
  templateUrl: 'word-slides.html',
})
export class WordSlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;
  sliderOptions: any = {
    loop: true,
    initialSlide: 1
  };
  default_slides_indexes = [];
  default_slides = [];
  slides: any[];
  head: number;
  tail: number;
  direction: number = 0;
  previousActiveIndex: number = -1;

  words: any[] = [];
  currentIndex: number = 0;
  trackIndexSubscription: Subscription;
  hideBookmark: boolean = false;
  hideAudioBar: boolean = false;
  playSingleWord: boolean = false;
  singleTrack: MediaPlugin = null;
  firstTime: boolean = true;

  intervalUpdateDom: any;

  constructor(private navCtrl: NavController, private audioService: AudioService,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private modalCtrl: ModalController, private loader: LoaderService) {
    let params = this.navParams.data;
    this.hideBookmark = params.hideBookmark;
    if (params.playSingleWord) {
      this.playSingleWord = this.hideAudioBar = true;
      this.words = params.listWord;
      this.default_slides_indexes = [ this.previousWordIndex(params.wordIndex), params.wordIndex, this.nextWordIndex(params.wordIndex) ];
    } else {
      this.words = this.audioService.listWordOrder.map(
        wordIndex => this.audioService.listWord[wordIndex]
      );
      if (this.sliderService.currentSlide >= 0) {
        let wordIndex = this.sliderService.currentSlide;
        this.default_slides_indexes = [
          this.previousWordIndex(wordIndex),
          wordIndex,
          this.nextWordIndex(wordIndex)
        ];
      } else {
        this.default_slides_indexes = [ this.previousWordIndex(0), 0, this.nextWordIndex(0) ];
      }
    }

    this.words.forEach((word) => {
      word.meaningList = word.meaning.map((e) => e.mean);
    });
    this.default_slides = this.default_slides_indexes.map((e) => this.makeSlide(e));
    this.slides = [...this.default_slides];
    this.head = this.slides[0].nr;
    this.tail = this.slides[this.slides.length - 1].nr;
  }

  previousWordIndex(wordIndex) {
    if (this.words.length === 1) return 0;
    if (wordIndex === 0) return this.words.length - 1;
    return wordIndex - 1;
  }

  nextWordIndex(wordIndex) {
    if (this.words.length === 1) return 0;
    if (wordIndex === this.words.length - 1) return 0;
    return wordIndex + 1;
  }

  getColor(nr) {
    // return nr % 2 === 0 ? '#59a8f2' : '#51b147';
    return '#51b147';
  }

  makeSlide(nr) {
    return {
      nr: nr,
      color: this.getColor(nr)
    };
  }

  ionViewDidEnter() {
    this.loader.hide();
    this.intervalUpdateDom = setInterval(this.updateDuplicateNode, 500);
  }

  ionViewWillEnter() {
    if (!this.playSingleWord)
      this.trackIndexSubscription = this.audioService.trackIndexSubject.subscribe(
        (trackIndex) => {
          this.sliderService.currentSlide = trackIndex;
          let slideIndexes = [ this.previousWordIndex(trackIndex), trackIndex, this.nextWordIndex(trackIndex) ];
          this.slides = slideIndexes.map((e) => this.makeSlide(e));
          this.head = this.slides[0].nr;
          this.tail = this.slides[this.slides.length - 1].nr;
          this.vocabSlider.slideTo(2, 0, false);
          this.previousActiveIndex = 2;
        }
      );
  }

  ionViewWillLeave() {
    this.loader.show();
    if (this.playSingleWord) return this.singleTrack.release();
    this.trackIndexSubscription.unsubscribe();
    this.audioService.stopCountDown();
    this.audioService.pauseCurrentTrack();
    clearInterval(this.intervalUpdateDom);
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  getSlideIndex(activeIndex) {
    if (activeIndex === 1 || activeIndex === 4) return 0;
    if (activeIndex === 3 || activeIndex === 0) return 2;
    return 1;
  }

  onSlideChanged($event) {
    let i = this.getSlideIndex($event.activeIndex);
    if (!this.firstTime) {
      let previousIndex = i === 0 ? 2 : i - 1;
      let nextIndex = i === 2 ? 0 : i + 1;
      let newDirection = $event.activeIndex > this.previousActiveIndex ? 1 : -1;
      this.slides[newDirection > 0 ? nextIndex : previousIndex] = this.createSlideData(newDirection, this.direction);
      this.direction = newDirection;
    } else {
      this.firstTime = false;
    }

    this.currentIndex = this.slides[i].nr;
    if (this.playSingleWord) {
      if (this.singleTrack) {
        this.singleTrack.release();
      }
      utils.resolveIntervalUrl(`${cordova.file.dataDirectory}${this.words[this.currentIndex].audioFolder}`, this.words[this.currentIndex].audioFile)
        .then((url) => {
          this.singleTrack = new MediaPlugin(url);
          this.singleTrack.play();
        });
      this.dbService.updateAnalytic(this.words[this.currentIndex]);
    } else {
      this.sliderService.currentSlide = this.currentIndex;
      if (this.sliderService.firstTime) return this.sliderService.firstTime = false;
      this.audioService.seekToWord(this.currentIndex);
    }
  }

  createSlideData(newDirection, oldDirection) {
    if (newDirection === 1) {
      this.tail = oldDirection < 0 ? this.head + 3 : this.tail + 1;
    } else {
      this.head = oldDirection > 0 ? this.tail - 3 : this.head - 1;
    }
    this.head = (this.head + this.words.length * 3) % this.words.length;
    this.tail = (this.tail + this.words.length * 3) % this.words.length;
    let nr = newDirection === 1 ? this.tail : this.head;
    if (this.default_slides_indexes.indexOf(nr) !== -1) {
      return this.default_slides[this.default_slides_indexes.indexOf(nr)];
    }
    return this.makeSlide(nr);
  }

  updateDuplicateNode() {
    let dupStartNodes = document.querySelectorAll(".slide-content-0");
    let dupEndNodes = document.querySelectorAll(".slide-content-2");
    if (dupStartNodes.length !== 2 || dupEndNodes.length !== 2) return;
    let dupStartNode = <HTMLElement>dupStartNodes.item(1);
    let startNode = <HTMLElement>dupStartNodes.item(0);
    dupStartNode.innerHTML = startNode.innerHTML;
    dupStartNode.style.backgroundColor = startNode.style.backgroundColor;

    let dupEndNode = <HTMLElement>dupEndNodes.item(0);
    let endNode = <HTMLElement>dupEndNodes.item(1);
    dupEndNode.innerHTML = endNode.innerHTML;
    dupEndNode.style.backgroundColor = endNode.style.backgroundColor;
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

  closeSlide($event) {
    $event.stopPropagation();
    this.navCtrl.pop();
  }
}
