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
  isRepeat: boolean = false;
  isShuffle: boolean = false;

  constructor(private _audioService: AudioService) {
    this.currentTrack = this._audioService.currentTrack;
  }

  handleSeekAudio($event) {
    this._audioService.seekPercent($event.value);
  }

  toggleRepeat($event) {
    this.isRepeat = !this.isRepeat;
    $event.stopPropagation();
  }

  toggleShuffle($event) {
    this.isShuffle = !this.isShuffle;
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
