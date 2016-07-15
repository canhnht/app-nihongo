import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {CourseService} from '../../services/course.service';
import {Toast} from 'ionic-native';
import {Subscription} from 'rxjs';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistDetail} from '../playlist-detail/playlist-detail';

@Component({
  templateUrl: 'build/pages/playlists-page/playlists-page.html',
  directives: [AudioSetting],
})
export class PlaylistsPage {
  playlists: any[] = [];
  playlistSubscription: Subscription;
  selectedPlaylists: string[] = [];

  constructor(private navController: NavController, private courseService: CourseService,
    private audioService: AudioService, private sliderService: SliderService) {
    this.courseService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
        return this.courseService.getListCourse()
      })
      .then(listCourse => {
        this.playlists.forEach(playlist => {
          playlist.listWord = playlist.listWordNumber.map(wordNumber => {
            let searchWord = {};
            listCourse.forEach(course => {
              course.units.forEach(unit => {
                unit.words.some(word => {
                  if (word.number == wordNumber) {
                    searchWord = word;
                    return true;
                  }
                  return false;
                });
              });
            });
            return searchWord;
          });
        });
      });
  }

  ionViewWillEnter() {
    this.playlistSubscription = this.courseService.playlistSubject.subscribe(
      playlist => {
        let searchIndex = this.playlists.findIndex(item => item._id == playlist._id);
        if (searchIndex == -1) this.playlists.push(playlist);
        else this.playlists[searchIndex] = playlist;
      }
    )
  }

  ionViewWillLeave() {
    this.playlistSubscription.unsubscribe();
  }

  goToPlaylistDetail(playlist) {
    this.navController.push(PlaylistDetail, { selectedPlaylist: playlist });
  }

  checkPlaylist($event, playlist) {
    let index: number = this.selectedPlaylists.indexOf(playlist._id);
    if (index >= 0)
      this.selectedPlaylists.splice(index, 1);
    else
      this.selectedPlaylists.push(playlist._id);
    $event.stopPropagation();
  }

  toggleSelectAll() {
    if (this.selectedPlaylists.length == this.playlists.length) {
      this.selectedPlaylists = [];
    } else {
      this.selectedPlaylists = [];
      this.playlists.forEach(playlist => {
        this.selectedPlaylists.push(playlist._id);
      });
    }
  }

  playSelectedList() {
    let listWord = this.selectedPlaylists.map(
      e => this.playlists.find(item => item._id == e).listWord
    ).reduce((ar, e) => ar.concat(e), []);
    this.audioService.playPlaylists(listWord);
    this.sliderService.resetSlider();
    this.sliderService.currentSlide = 1;
    this.selectedPlaylists = [];
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

  addNewPlaylist() {
    let prompt = Alert.create({
      title: 'Add new playlist',
      inputs: [
        {
          name: 'title',
          placeholder: 'Enter new playlist name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            let searchIndex = this.playlists.findIndex(item => item.name == data.title);
            if (searchIndex >= 0)
              Toast.showShortCenter('Playlist name already exists! Please choose another name')
                .subscribe(() => {});
            else {
              let newPlaylist = {
                _id: `playlist${this.playlists.length + 1}`,
                name: data.title,
                listWordNumber: []
              };
              this.courseService.addPlaylist(newPlaylist);
            }
          }
        }
      ]
    });
    this.navController.present(prompt);
  }
}
