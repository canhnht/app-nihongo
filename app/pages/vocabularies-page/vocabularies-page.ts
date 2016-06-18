import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Vocabulary} from '../../providers/vocabulary.interface';
import {Unit} from '../../providers/unit.interface';
import {LIST_VOCABULARY} from '../../providers/list-vocabulary.data';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

@Component({
  templateUrl: 'build/pages/vocabularies-page/vocabularies-page.html',
  directives: [BottomAudioController],
})
export class VocabulariesPage {
  private unit: Unit;
  private vocabularies: Vocabulary[] = LIST_VOCABULARY;
  private selectedVocabularies: Vocabulary[] = [];

  constructor(private navController: NavController, private navParams: NavParams) {
    this.unit = this.navParams.data.selectedUnit;
  }

  ionViewWillEnter() {
    this.selectedVocabularies = [];
  }

  checkVocabulary($event, vocabulary) {
    let index: number = this.selectedVocabularies.indexOf(vocabulary.id);
    if (index >= 0)
      this.selectedVocabularies.splice(index, 1);
    else
      this.selectedVocabularies.push(vocabulary.id);
    $event.stopPropagation();
  }

  starVocabulary(vocabulary) {
    vocabulary.starred = !vocabulary.starred;
  }

  uncheckAll() {
    this.selectedVocabularies = [];
  }
}
