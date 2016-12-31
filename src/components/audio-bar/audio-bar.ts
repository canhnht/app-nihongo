import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Toast, MediaPlugin } from 'ionic-native';

@Component({
  selector: 'audio-bar',
  templateUrl: 'audio-bar.html',
})
export class AudioBar implements OnInit, OnDestroy {
  @Input() audioLink: string;
  intervalGetCurrentPosition: any;
  currentTime: string = "0:00";
  duration: string = "0:00";
  playedPercent: any = 0;
  media: MediaPlugin;
  playing: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.media = new MediaPlugin(this.audioLink);
  }

  ngOnDestroy() {
    this.pause();
    this.media.release();
  }

  play() {
    this.media.play();
    this.playing = true;
    this.startGetCurrentPositionInterval();
  }

  pause() {
    this.media.pause();
    this.playing = false;
    this.stopGetCurrentPositionInterval();
  }

  private convertText(seconds) {
    let text = '';
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60).toString();
    seconds = (seconds % 60).toString();
    while (seconds.length < 2) seconds = '0' + seconds;
    text += `${minutes}:${seconds}`;
    return text;
  }

  private startGetCurrentPositionInterval() {
    let countError = 0;
    let checkError = true;
    this.intervalGetCurrentPosition = setInterval(() => {
      let duration = this.media.getDuration();
      this.duration = this.convertText(Math.max(duration, 0));
      this.media.getCurrentPosition().then(position => {
        Toast.showShortBottom(`media ${duration} -- ${position}`).subscribe(() => {});
        if (position >= 0) {
          checkError = false;
          this.currentTime = this.convertText(Math.max(position, 0));
          this.playedPercent = Math.ceil(position / duration * 100);
        } else {
          if (checkError) {
            ++countError;
            if (countError >= 5)
              this.pause();
          } else {
            this.pause();
          }
        }
      }).catch(err => {
        Toast.showShortBottom('ERROR getCurrentPosition ' + JSON.stringify(err)).subscribe(() => {});
      })
    }, 1000);
  }

  private stopGetCurrentPositionInterval() {
    clearInterval(this.intervalGetCurrentPosition);
  }
}
