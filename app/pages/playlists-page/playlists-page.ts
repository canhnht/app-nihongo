import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {Toast, SpinnerDialog} from 'ionic-native';
import {Subscription} from 'rxjs';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistDetail} from '../playlist-detail/playlist-detail';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/playlists-page/playlists-page.html',
})
export class PlaylistsPage {
  playlists: any[] = [];
  playlistSubscription: Subscription;

  constructor(private navController: NavController, private dbService: DbService,
    private translate: TranslateService) {
  }

  ionViewWillEnter() {
    this.dbService.getAllPlaylists().then(
      allPlaylists => this.playlists = allPlaylists
    );
    this.playlistSubscription = this.dbService.playlistSubject.subscribe(
      playlist => {
        let searchIndex = this.playlists.findIndex(item => item._id == playlist._id);
        if (searchIndex == -1) this.playlists.push(playlist);
        else this.playlists[searchIndex] = playlist;
      }
    );
  }

  ionViewWillLeave() {
    this.playlistSubscription.unsubscribe();
  }

  goToPlaylistDetail($event, playlist) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.navController.push(PlaylistDetail, { selectedPlaylistId: playlist._id });
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
