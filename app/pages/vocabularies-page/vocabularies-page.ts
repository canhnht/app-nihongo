import {Component} from '@angular/core';
import {NavController, NavParams, Popover} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {Vocabulary} from '../../providers/vocabulary.interface';
import {Unit} from '../../providers/unit.interface';
import {LIST_VOCABULARY} from '../../providers/list-vocabulary.data';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../providers/audio.service';
import {SliderService} from '../../providers/slider.service';
import {VocabularySlides} from '../vocabulary-slides/vocabulary-slides';

@Component({
  templateUrl: 'build/pages/vocabularies-page/vocabularies-page.html',
  directives: [AudioSetting],
})
export class VocabulariesPage {
  private unit: Unit;
  private vocabularies: Vocabulary[] = LIST_VOCABULARY;
  private selectedVocabularies: number[] = [];

  constructor(private _navController: NavController, private navParams: NavParams,
    private _audioService: AudioService, private sliderService: SliderService) {
    this.unit = this.navParams.data.selectedUnit;
  }

  ionViewWillEnter() {
    this.selectedVocabularies = [];
  }

  selectVocabulary(vocabulary) {
    let vocabIndex = this.vocabularies.findIndex(item => item.id == vocabulary.id);
    this._audioService.playVocabulary(vocabIndex);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = vocabIndex;
    Toast.show(`selectVocabulary ${this.sliderService.currentSlide}`, '500', 'top')
      .subscribe(() => {});
    this._navController.push(VocabularySlides,
      {title: 'Course 1 - Unit 2'});
  }

  checkVocabulary($event, vocabulary) {
    let index: number = this.selectedVocabularies.indexOf(vocabulary.id);
    if (index >= 0)
      this.selectedVocabularies.splice(index, 1);
    else
      this.selectedVocabularies.push(vocabulary.id);
    $event.stopPropagation();
  }

  toggleBookmark($event, vocabulary) {
    vocabulary.starred = !vocabulary.starred;
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedVocabularies.length == this.vocabularies.length) {
      this.selectedVocabularies = [];
    } else {
      this.selectedVocabularies = [];
      this.vocabularies.forEach(vocabulary => {
        this.selectedVocabularies.push(vocabulary.id);
      });
    }
  }

  goToSlides() {
    this.sliderService.resetSlider();
    if (this._audioService.isPlaying) {
      this._navController.push(VocabularySlides,
        {title: 'Course 2 - Unit 3'});
    }
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Select all', 'Play all', 'Setting']
    });
    this._navController.present(popover, {
      ev: $event
    });
  }
}
