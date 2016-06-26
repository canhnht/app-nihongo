import {Component} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {AudioService} from '../../providers/audio.service';

@Component({
  selector: 'bottom-audio-controller',
  templateUrl: 'build/components/bottom-audio-controller/bottom-audio-controller.html',
  directives: [IONIC_DIRECTIVES],
})
export class BottomAudioController {
  title: string = 'Please select a track to play';
  data: any;
  isPlaying: boolean = false;

  constructor(private _audioService: AudioService) {
    this.data = this._audioService.data;
  }

  play() {
    this.isPlaying = true;
    console.log('shit:bottom:21 ' + this.isPlaying);
    this._audioService.play();
  }

  pause() {
    this.isPlaying = false;
    console.log('shit:bottom:27 ' + this.isPlaying);
    this._audioService.pause();
  }
}
