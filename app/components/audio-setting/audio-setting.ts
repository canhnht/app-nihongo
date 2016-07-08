import {Component, Input} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioService} from '../../providers/audio.service';
import {VocabularySlides} from '../../pages/vocabulary-slides/vocabulary-slides';

@Component({
  selector: 'audio-setting',
  templateUrl: 'build/components/audio-setting/audio-setting.html',
  directives: [IONIC_DIRECTIVES],
})
export class AudioSetting {
  @Input() isReady: boolean;
  currentTrack: any = {};

  constructor(private _audioService: AudioService) {
    this.currentTrack = this._audioService.currentTrack;
  }

  toggleLoop($event) {
    console.log('toggleLoop');
    this._audioService.toggleLoop();
    $event.stopPropagation();
  }

  toggleShuffle($event) {
    this._audioService.toggleShuffle();
    $event.stopPropagation();
  }
}
