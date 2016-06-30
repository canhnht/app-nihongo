import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioService} from '../../providers/audio.service';

@Component({
  selector: 'bottom-audio-controller',
  templateUrl: 'build/components/bottom-audio-controller/bottom-audio-controller.html',
  directives: [IONIC_DIRECTIVES],
})
export class BottomAudioController {
  currentTrack: any = {};
  isRepeat: boolean = false;
  isShuffle: boolean = false;

  constructor(private _audioService: AudioService) {
    this.currentTrack = this._audioService.currentTrack;
  }

  handleSeekAudio($event) {
    Toast.show(`max ${$event.value}`, '500', 'top')
      .subscribe(() => {});
    this._audioService.seekPercent($event.value);
  }

  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
  }

  play() {
    this._audioService.playCurrentTrack();
  }

  pause() {
    this._audioService.pauseCurrentTrack();
  }

  seek($event) {
    console.log($event);
    let x = $event.layerX;
    let width = $event.srcElement.clientWidth;
    this._audioService.seekPercent(x / width * 100);

    Toast.show(`Event: ${x}, ${$event.layerY}, ${width}`, '2000', 'center')
      .subscribe(() => {});
  }
}
