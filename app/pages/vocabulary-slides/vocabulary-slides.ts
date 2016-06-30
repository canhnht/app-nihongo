import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Slides} from 'ionic-angular';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';
import {AudioService} from '../../providers/audio.service';
import {LIST_VOCABULARY} from '../../providers/list-vocabulary.data';
import {Vocabulary} from '../../providers/vocabulary.interface';

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

  constructor(private _navController: NavController, private navParams: NavParams) {
    this.title = this.navParams.data.title;
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }
}
