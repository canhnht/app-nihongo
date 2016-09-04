import {Component, ViewChild, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Toast} from 'ionic-native';
import {AudioService} from '../../services/audio.service';

@Component({
  selector: 'audio-bar',
  templateUrl: 'build/components/audio-bar/audio-bar.html',
  directives: [IONIC_DIRECTIVES],
})
export class AudioBar {

  constructor() {
  }
}
