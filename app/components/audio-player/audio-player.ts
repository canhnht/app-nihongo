import {Component, ViewChild, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioService} from '../../providers/audio.service';
import {VocabularySlides} from '../../pages/vocabulary-slides/vocabulary-slides';

@Component({
  selector: 'audio-player',
  templateUrl: 'build/components/audio-player/audio-player.html',
  directives: [IONIC_DIRECTIVES],
})
export class AudioPlayer {
  currentTrack: any = {};

  constructor(private audioService: AudioService) {
    this.currentTrack = this.audioService.currentTrack;
  }

  handleSeekAudio($event) {
    this.audioService.seekPercent($event.value);
  }

  play($event) {
    this.audioService.playCurrentTrack();
    $event.stopPropagation();
  }

  pause($event) {
    this.audioService.pauseCurrentTrack();
    $event.stopPropagation();
  }
}
