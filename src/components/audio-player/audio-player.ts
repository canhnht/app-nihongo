import { Component } from '@angular/core';
import { AudioService } from '../../services';

@Component({
  selector: 'audio-player',
  templateUrl: 'audio-player.html',
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
