import {Component, ViewChild} from '@angular/core';
import {NavController, Slides} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../providers/audio.service';
import {SliderService} from '../../providers/slider.service';
import {LIST_VOCABULARY} from '../../providers/list-vocabulary.data';
import {Vocabulary} from '../../providers/vocabulary.interface';
import {Toast} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/vocabulary-slides/vocabulary-slides.html',
  directives: [AudioPlayer],
})
export class VocabularySlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };
  vocabularies: Vocabulary[] = LIST_VOCABULARY;
  currentIndex: number = 0;

  constructor(private _navController: NavController, private audioService: AudioService,
    private sliderService: SliderService) {
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

  private getVocabularyIndex(activeIndex: number) {
    if (activeIndex == 1 || activeIndex == this.vocabularies.length + 1) return 0;
    if (activeIndex == this.vocabularies.length || activeIndex == 0) return this.vocabularies.length - 1;
    return activeIndex - 1;
  }

  onSlideChanged($event) {
    this.currentIndex = this.getVocabularyIndex($event.activeIndex);
    if (this.sliderService.currentSlide < 0 && this.sliderService.firstTime)
      this.sliderService.currentSlide = $event.activeIndex;
    if (this.sliderService.firstTime) return this.sliderService.firstTime = false;
    this.sliderService.currentSlide = $event.activeIndex;
    let vocabIndex: number = -1;
    let activeIndex = $event.activeIndex;
    if (activeIndex == 0 || activeIndex == this.vocabularies.length)
      vocabIndex = this.vocabularies.length - 1;
    else if (activeIndex == 1 || activeIndex == this.vocabularies.length + 1)
      vocabIndex = 0;
    else
      vocabIndex = activeIndex - 1;
    this.audioService.seekToVocabulary(vocabIndex);
  }

  repeatCurrentVocabulary($event) {
    this.audioService.repeatCurrentTrack();
    $event.stopPropagation();
  }

  toggleBookmark($event) {
    let vocabulary: Vocabulary = this.vocabularies[this.currentIndex];
    vocabulary.starred = !vocabulary.starred;
    $event.stopPropagation();
  }

  closeSlide() {
    this.audioService.pauseCurrentTrack();
    this._navController.pop();
  }
}
