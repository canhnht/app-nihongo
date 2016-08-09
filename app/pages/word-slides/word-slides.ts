import {Component, ViewChild} from '@angular/core';
import {NavController, Slides, Alert, NavParams} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog, MediaPlugin} from 'ionic-native';
import {Subscription} from 'rxjs';

@Component({
  templateUrl: 'build/pages/word-slides/word-slides.html',
  directives: [AudioPlayer],
})
export class WordSlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };
  words: any[] = [];
  course: any;
  currentIndex: number = 0;
  currentCourseSubscription: Subscription;
  trackIndexSubscription: Subscription;
  playlistSubscription: Subscription;
  playlists: any[];
  hideBookmark: boolean = false;
  hideAudioBar: boolean = false;
  playSingleWord: boolean = false;
  singleTrack: MediaPlugin = null;
  // basePath: string = 'file:///storage/emulated/0/Android/data/io.techybrain.app_nihongo/files/';
  basePath: string = 'file:///android_asset/www/audio/';

  constructor(private navController: NavController, private audioService: AudioService,
    private sliderService: SliderService, private dbService: DbService,
    private navParams: NavParams) {
    let params = this.navParams.data;
    this.hideBookmark = params.hideBookmark;
    if (params.playSingleWord) {
      this.playSingleWord = this.hideAudioBar = true;
      this.words = params.listWord;
      this.sliderOptions.initialSlide = params.wordIndex;
      // this.singleTrack = new MediaPlugin(`${this.basePath}${this.words[params.wordIndex].audioFile}.mp3`);
      // this.singleTrack.play();
    } else {
      this.words = this.audioService.listWordOrder.map(
        wordIndex => this.audioService.listWord[wordIndex]
      );
      if (this.sliderService.currentSlide >= 0)
        this.sliderOptions.initialSlide = this.sliderService.currentSlide - 1;
    }
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  ionViewWillEnter() {
    this.course = this.dbService.currentCourse;
    this.currentCourseSubscription = this.dbService.currentCourseSubject.subscribe(
      course => this.course = course
    );
    this.dbService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
      });
    this.playlistSubscription = this.dbService.playlistSubject.subscribe(
      playlist => {
        this.playlists = this.playlists.map(item => {
          if (item._id == playlist._id) return playlist;
          else return item;
        });
      }
    );

    this.trackIndexSubscription = this.audioService.trackIndexSubject.subscribe(
      trackIndex => this.vocabSlider.slideTo(trackIndex + 1)
    );
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.playlistSubscription.unsubscribe();
    if (this.playSingleWord) return this.singleTrack.release();
    this.trackIndexSubscription.unsubscribe();
    this.audioService.pauseCurrentTrack();
  }

  prev() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  private getWordIndex(activeIndex: number) {
    if (activeIndex == 1 || activeIndex == this.words.length + 1) return 0;
    if (activeIndex == this.words.length || activeIndex == 0) return this.words.length - 1;
    return activeIndex - 1;
  }

  onSlideChanged($event) {
    if (this.playSingleWord) {
      this.currentIndex = this.getWordIndex($event.activeIndex);
      if (this.singleTrack) {
        this.singleTrack.release();
      }
      this.singleTrack = new MediaPlugin(`${this.basePath}${this.words[this.currentIndex].audioFile}.mp3`);
      this.singleTrack.play();
      return;
    }

    this.currentIndex = this.getWordIndex($event.activeIndex);
    if (this.sliderService.currentSlide < 0 && this.sliderService.firstTime)
      this.sliderService.currentSlide = $event.activeIndex;
    if (this.sliderService.firstTime) return this.sliderService.firstTime = false;
    this.sliderService.currentSlide = $event.activeIndex;
    let wordIndex: number = -1;
    let activeIndex = $event.activeIndex;
    if (activeIndex == 0 || activeIndex == this.words.length)
      wordIndex = this.words.length - 1;
    else if (activeIndex == 1 || activeIndex == this.words.length + 1)
      wordIndex = 0;
    else
      wordIndex = activeIndex - 1;
    this.audioService.seekToWord(wordIndex);
  }

  repeatCurrentVocabulary($event) {
    if (this.playSingleWord) this.singleTrack.seekTo(0);
    else this.audioService.repeatCurrentTrack();
    $event.stopPropagation();
  }

  addToPlaylist($event) {
    let word = this.words[this.currentIndex];
    let alert = Alert.create();
    alert.setTitle('Add word to');
    this.playlists.forEach((playlist, index) => {
      alert.addInput({
        type: 'checkbox',
        label: playlist.name,
        value: index + '',
        checked: playlist.listWordNumber.indexOf(word.number) >= 0
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        data = data.map(e => parseInt(e));
        data.forEach(index => {
          if (this.playlists[index].listWordNumber.indexOf(word.number) == -1)
            this.playlists[index].listWordNumber.push(word.number);
        });
        this.playlists.forEach((playlist, index) => {
          let searchIndex = playlist.listWordNumber.indexOf(word.number);
          if (searchIndex >= 0 && data.indexOf(index) == -1) {
            playlist.listWordNumber.splice(searchIndex, 1);
          }
        });
        this.dbService.updateMultiplePlaylists(this.playlists);
      }
    });
    this.navController.present(alert);
    $event.stopPropagation();
  }

  closeSlide() {
    this.navController.pop();
  }
}
