import {Component, ViewChild, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioService} from '../../providers/audio.service';
import {VocabularySlides} from '../../pages/vocabulary-slides/vocabulary-slides';

@Component({
  selector: 'bottom-audio-controller',
  templateUrl: 'build/components/bottom-audio-controller/bottom-audio-controller.html',
  directives: [IONIC_DIRECTIVES],
})
export class BottomAudioController {
  @Output() onAudioClick = new EventEmitter();
  currentTrack: any = {};

  constructor(private _audioService: AudioService) {
    this.currentTrack = this._audioService.currentTrack;
  }

  handleSeekAudio($event) {
    this._audioService.seekPercent($event.value);
  }

  toggleLoop($event) {
    this._audioService.toggleLoop();
    $event.stopPropagation();
  }

  toggleShuffle($event) {
    this._audioService.toggleShuffle();
    $event.stopPropagation();
  }

  play($event) {
    this._audioService.playCurrentTrack();
    $event.stopPropagation();
  }

  pause($event) {
    this._audioService.pauseCurrentTrack();
    $event.stopPropagation();
  }

  goToSlides() {
    this.onAudioClick.emit({});
  }
}
