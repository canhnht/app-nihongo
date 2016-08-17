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
import {TranslateService} from 'ng2-translate/ng2-translate';

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
    private settingService: SettingService, private translate: TranslateService) {
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
    this.settingService.togglePlaylist(playlist);
  }

  toggleSelectAll() {
    if (this.selectedPlaylists.length == this.playlists.length) {
      this.settingService.selectPlaylists([]);
    } else {
      this.settingService.selectPlaylists(this.playlists);
    }
  }

  goToWordSlides() {
    this.navController.push(WordSlides, { hideBookmark: true });
  }

  addNewPlaylist() {
    let prompt = Alert.create({
      title: this.translate.instant('Add_new_playlist'),
      inputs: [
        {
          name: 'title',
          placeholder: this.translate.instant('Enter_playlist')
        },
      ],
      buttons: [
        {
          text: this.translate.instant('Cancel'),
        },
        {
          text: this.translate.instant('Save'),
          handler: data => {
            let searchIndex = this.playlists.findIndex(item => item.name == data.title);
            if (searchIndex >= 0)
              Toast.showShortCenter(this.translate.instant('Duplicate_playlist_message'))
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
      title: this.translate.instant('Edit_playlist'),
      inputs: [
        {
          name: 'title',
          value: playlist.name
        },
      ],
      buttons: [
        {
          text: this.translate.instant('Cancel'),
        },
        {
          text: this.translate.instant('Save'),
          handler: data => {
            let searchIndex = this.playlists.findIndex(item => item.name == data.title);
            if (searchIndex >= 0)
              Toast.showShortCenter(this.translate.instant('Duplicate_playlist_message'))
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
