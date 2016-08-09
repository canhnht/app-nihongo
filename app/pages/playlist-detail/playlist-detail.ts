import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {WordSlides} from '../word-slides/word-slides';

@Component({
  templateUrl: 'build/pages/playlist-detail/playlist-detail.html',
  directives: [AudioSetting],
})
export class PlaylistDetail {
  playlist: any;
  words: any[] = [];
  selectedWords: number[] = [];
  currentCourseSubscription: Subscription;
  playlistSubscription: Subscription;
  playlists: any[];

  constructor(private navController: NavController, private navParams: NavParams,
    private audioService: AudioService, private sliderService: SliderService) {
    this.playlist = this.navParams.data.selectedPlaylist;
    this.words = this.playlist.listWord;
  }

  ionViewWillEnter() {
    this.selectedWords = [];
  }

  selectWord(word) {
    let wordIndex = this.words.findIndex(item => item.number == word.number);
    this.audioService.playWordInPlaylist(this.playlist.listWord, wordIndex);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide =
      this.audioService.listWordOrder.indexOf(wordIndex) + 1;
    this.navController.push(WordSlides, { hideBookmark: true });
  }

  checkWord($event, word) {
    let index: number = this.selectedWords.indexOf(word.number);
    if (index >= 0)
      this.selectedWords.splice(index, 1);
    else
      this.selectedWords.push(word.number);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedWords.length == this.words.length) {
      this.selectedWords = [];
    } else {
      this.selectedWords = [];
      this.words.forEach(word => {
        this.selectedWords.push(word.number);
      });
    }
  }

  playSelectedList() {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    this.audioService.playListWordInPlaylist(this.playlist.listWord, this.selectedWords);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = 1;
    this.selectedWords = [];
    this.navController.push(WordSlides, { hideBookmark: true });
  }

  continuePlaying() {
    this.audioService.playCurrentTrack();
    this.audioService.generateListWordOrder();
    if (this.audioService.playSingleWord)
      this.sliderService.currentSlide =
        this.audioService.listWordOrder.indexOf(this.audioService.singleWordIndex) + 1;
    this.navController.push(WordSlides, { hideBookmark: true });
  }
}
