import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog} from 'ionic-native';
import {Subscription} from 'rxjs';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {SettingService, SelectedType, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistDetail} from '../playlist-detail/playlist-detail';

@Component({
  templateUrl: 'build/pages/playlists-page/playlists-page.html',
  directives: [AudioSetting],
})
export class PlaylistsPage {
  playlists: any[] = [];
  playlistSubscription: Subscription;
  settingSubscription: Subscription;
  selectedPlaylists: any[] = [];

  constructor(private navController: NavController, private dbService: DbService,
    private audioService: AudioService, private sliderService: SliderService,
    private settingService: SettingService) {
    this.dbService.getAllPlaylists().then(
      allPlaylists => this.playlists = allPlaylists
    );
  }

  ionViewWillEnter() {
    this.playlistSubscription = this.dbService.playlistSubject.subscribe(
      playlist => {
        let searchIndex = this.playlists.findIndex(item => item._id == playlist._id);
        if (searchIndex == -1) this.playlists.push(playlist);
        else this.playlists[searchIndex] = playlist;
      }
    );

    if (this.settingService.selectedType === SelectedType.Playlist
      && this.settingService.status === SettingStatus.Playing)
      this.selectedPlaylists = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === SelectedType.Playlist)
          this.selectedPlaylists = setting.selectedList;
      }
    );
  }

  ionViewWillLeave() {
    this.playlistSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.selectedPlaylists = [];
    this.settingService.reset();
  }

  goToPlaylistDetail(playlist) {
    this.navController.push(PlaylistDetail, { selectedPlaylist: playlist });
  }

  checkPlaylist($event, playlist) {
    $event.stopPropagation();
    this.settingService.addPlaylist(playlist);
  }

  toggleSelectAll() {
    if (this.selectedPlaylists.length == this.playlists.length) {
      this.settingService.selectPlaylists([]);
    } else {
      this.settingService.selectPlaylists(this.playlists);
    }
  }

  playSelectedList() {
    SpinnerDialog.show('Processing', 'Please wait a second', false);
    this.audioService.playSetting();
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
              let lastId = parseInt(this.playlists[this.playlists.length - 1]._id.substring(8));
              let newPlaylist = {
                _id: `playlist${lastId + 1}`,
                name: data.title,
                words: []
              };
              this.dbService.addPlaylist(newPlaylist);
            }
          }
        }
      ]
    });
    this.navController.present(prompt);
  }

  deletePlaylist(playlist) {
    let searchIndex = this.playlists.findIndex(item => item._id == playlist._id);
    this.playlists.splice(searchIndex, 1);
    this.dbService.deletePlaylist(playlist);
  }

  editPlaylist(playlist) {
    let prompt = Alert.create({
      title: 'Edit playlist',
      inputs: [
        {
          name: 'title',
          value: playlist.name
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
              playlist.name = data.title;
              this.dbService.updatePlaylist(playlist);
            }
          }
        }
      ]
    });
    this.navController.present(prompt);
  }
}
