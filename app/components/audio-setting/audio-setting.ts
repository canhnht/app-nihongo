import {Component, Input, Output, EventEmitter} from '@angular/core';
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
  @Output() onReady = new EventEmitter();

  currentTrack: any = {};

  constructor(private audioService: AudioService) {
    this.currentTrack = this.audioService.currentTrack;
  }

  toggleLoop($event) {
    console.log('toggleLoop');
    this.audioService.toggleLoop();
    $event.stopPropagation();
  }

  toggleShuffle($event) {
    this.audioService.toggleShuffle();
    $event.stopPropagation();
  }
}
