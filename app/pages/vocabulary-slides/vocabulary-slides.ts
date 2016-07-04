import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Slides} from 'ionic-angular';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';
import {AudioService} from '../../providers/audio.service';
import {SliderService} from '../../providers/slider.service';
import {LIST_VOCABULARY} from '../../providers/list-vocabulary.data';
import {Vocabulary} from '../../providers/vocabulary.interface';
import {Toast} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/vocabulary-slides/vocabulary-slides.html',
  directives: [BottomAudioController],
})
export class VocabularySlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };
  title: String = 'Mimi Kara Nihongo';
  private vocabularies: Vocabulary[] = LIST_VOCABULARY;

  constructor(private _navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService) {
    this.title = this.navParams.data.title;
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

  onSlideChanged($event) {
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
    console.log(vocabIndex);
    this.audioService.seekToVocabulary(vocabIndex);
  }

  toggleRepeatCurrentVocabulary($event) {
    this.audioService.toggleRepeatCurrentTrack();
    $event.stopPropagation();
  }
}
