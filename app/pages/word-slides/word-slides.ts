import {Component, ViewChild} from '@angular/core';
import {NavController, Slides} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {Toast} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/word-slides/word-slides.html',
  directives: [AudioPlayer],
})
export class WordSlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };
  words: any[] = [];
  currentIndex: number = 0;

  constructor(private _navController: NavController, private audioService: AudioService,
    private sliderService: SliderService) {
    this.words = this.audioService.listWord;
    if (this.sliderService.currentSlide >= 0)
      this.sliderOptions.initialSlide = this.sliderService.currentSlide - 1;
    this.audioService.trackIndexSubject.subscribe(trackIndex => {
      this.vocabSlider.slideTo(trackIndex + 1);
    })
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  private getWordIndex(activeIndex: number) {
    if (activeIndex == 1 || activeIndex == this.words.length + 1) return 0;
    if (activeIndex == this.words.length || activeIndex == 0) return this.words.length - 1;
    return activeIndex - 1;
  }

  onSlideChanged($event) {
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

  repeatCurrentVocabulary($event) {
    this.audioService.repeatCurrentTrack();
    $event.stopPropagation();
  }

  toggleBookmark($event) {
    let word = this.words[this.currentIndex];
    word.starred = !word.starred;
    $event.stopPropagation();
  }

  closeSlide() {
    this.audioService.pauseCurrentTrack();
    this._navController.pop();
  }
}
