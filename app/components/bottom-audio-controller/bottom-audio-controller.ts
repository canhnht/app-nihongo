import {Component} from '@angular/core';
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

  constructor(private _audioService: AudioService) {
    this._audioService.currentTrackSubject.subscribe(data => {

    });
    this.currentTrack = this._audioService.currentTrack;
  }

  play() {
    this._audioService.play();
  }

  pause() {
    this._audioService.pause();
  }

  seek($event) {
    console.log($event);
    let x = $event.layerX;
    let width = $event.srcElement.clientWidth;
    this._audioService.seek(x / width * 100);

    Toast.show(`Event: ${x}, ${$event.layerY}, ${width}`, '2000', 'center')
      .subscribe(
        toast => {}
      )
  }
}
