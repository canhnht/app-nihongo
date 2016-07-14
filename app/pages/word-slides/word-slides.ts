import {Component, ViewChild} from '@angular/core';
import {NavController, Slides, Alert} from 'ionic-angular';
import {AudioPlayer} from '../../components/audio-player/audio-player';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {CourseService} from '../../services/course.service';
import {Toast} from 'ionic-native';
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

  constructor(private navController: NavController, private audioService: AudioService,
    private sliderService: SliderService, private courseService: CourseService) {
    this.words = this.audioService.listWordOrder.map(
      wordIndex => this.audioService.listWord[wordIndex]
    );
    if (this.sliderService.currentSlide >= 0)
      this.sliderOptions.initialSlide = this.sliderService.currentSlide - 1;
  }

  ionViewWillEnter() {
    this.course = this.courseService.currentCourse;
    this.trackIndexSubscription = this.audioService.trackIndexSubject.subscribe(
      trackIndex => this.vocabSlider.slideTo(trackIndex + 1)
    );
    this.currentCourseSubscription = this.courseService.currentCourseSubject.subscribe(
      course => this.course = course
    );

    this.courseService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
      });
    this.playlistSubscription = this.courseService.playlistSubject.subscribe(
      playlist => {
        this.playlists = this.playlists.map(item => {
          if (item._id == playlist._id) return playlist;
          else return item;
        });
      }
    );
  }

  ionViewWillLeave() {
    this.currentCourseSubscription.unsubscribe();
    this.trackIndexSubscription.unsubscribe();
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
    this.audioService.repeatCurrentTrack();
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
        this.courseService.updateMultiplePlaylists(this.playlists);
      }
    });
    this.navController.present(alert);
    $event.stopPropagation();
  }

  toggleBookmark($event) {
    let word = this.words[this.currentIndex];
    word.starred = !word.starred;
    this.course.units.forEach(unit => {
      unit.words.forEach(item => {
        if (item.number == word.number)
          item.starred = word.starred;
      });
    });
    this.courseService.updateCourse(this.course);
    $event.stopPropagation();
  }

  closeSlide() {
    this.audioService.pauseCurrentTrack();
    this.navController.pop();
  }
}
