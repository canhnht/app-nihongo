import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ModalController, NavParams } from 'ionic-angular';
import { SpinnerDialog, MediaPlugin } from 'ionic-native';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PlaylistOptions } from '../../components';
import { AudioService, SliderService, DbService } from '../../services';

declare var cordova: any;

@Component({
  selector: 'page-playground',
  templateUrl: 'playground.html'
})
export class PlaygroundPage {
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

  constructor(private navCtrl: NavController, private audioService: AudioService,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams, private translate: TranslateService,
    private modalCtrl: ModalController) {
    this.words = [
      {
        kanji: 'kanji1',
      },
      {
        kanji: 'kanji2',
      }
    ];
    this.default_slides_indexes = [ this.previousWordIndex(0), 0, this.nextWordIndex(0) ];
    this.default_slides = this.default_slides_indexes.map((e) => this.makeSlide(e, this.words[e]));
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

  makeSlide(nr, data) {
    return Object.assign({
      nr: nr,
      color: this.getColor(nr)
    }, data);
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
    console.log(`event ${$event.activeIndex}`);
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

    console.log(`onSlideChanged ${JSON.stringify(this.slides)}`);
    if ($event.activeIndex === 4) {
      console.log('exception');
      this.vocabSlider.slideTo(1, 0, false);
      this.previousActiveIndex = 1;
      return;
    } else if ($event.activeIndex === 0) {
      console.log('exception');
      this.vocabSlider.slideTo(3, 0, false);
      this.previousActiveIndex = 3;
      return;
    }

    this.previousActiveIndex = $event.activeIndex;
    this.currentIndex = this.slides[i].nr;
    this.sliderService.currentSlide = this.currentIndex;
    if (this.sliderService.firstTime) return this.sliderService.firstTime = false;
  }

  createSlideData(newDirection, oldDirection) {
    if (newDirection === 1) {
      this.tail = oldDirection < 0 ? this.head + 3 : this.tail + 1;
    } else {
      this.head = oldDirection > 0 ? this.tail - 3 : this.head - 1;
    }
    console.log(`before ${this.head} ${this.tail}`);
    this.head = (this.head + this.words.length * 3) % this.words.length;
    this.tail = (this.tail + this.words.length * 3) % this.words.length;
    console.log(`after ${this.head} ${this.tail}`);
    let nr = newDirection === 1 ? this.tail : this.head;
    if (this.default_slides_indexes.indexOf(nr) !== -1) {
      return this.default_slides[this.default_slides_indexes.indexOf(nr)];
    }
    return this.makeSlide(nr, this.words[nr]);
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

  ngAfterViewChecked() {
    this.updateDuplicateNode();
  }

  closeSlide() {
    this.navCtrl.pop();
  }

  flipCard(word) {
    console.log(`flipCard ${JSON.stringify(word)}`);
    word.flipped = !word.flipped;
  }
}
