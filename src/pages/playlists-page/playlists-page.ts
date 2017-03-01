import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Toast } from 'ionic-native';
import { Subscription } from 'rxjs';
import { DbService, SettingService } from '../../services';
import { PlaylistDetail } from '../playlist-detail/playlist-detail';

@Component({
  templateUrl: 'playlists-page.html',
})
export class PlaylistsPage {
  playlists: any[] = [];
  playlistsSubscription: Subscription;

  constructor(private navCtrl: NavController, private dbService: DbService,
    private translate: TranslateService, private alertCtrl: AlertController,
    private settingService: SettingService) {
  }

  ionViewWillEnter() {
    this.dbService.getAllPlaylists();
    this.playlistsSubscription = this.dbService.playlistsSubject.subscribe(
      playlists => this.playlists = playlists
    );
  }

  ionViewWillLeave() {
    this.playlistsSubscription.unsubscribe();
  }

  goToPlaylistDetail($event, playlist) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    this.settingService.reset(true);
    this.navCtrl.push(PlaylistDetail, { selectedPlaylist: playlist });
  }

  addNewPlaylist() {
    let prompt = this.alertCtrl.create({
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
          handler: (data) => {
            let searchIndex = this.playlists.findIndex(item => item.name == data.title);
            if (searchIndex >= 0)
              Toast.showShortCenter(this.translate.instant('Duplicate_playlist_message'))
                .subscribe(() => {});
            else {
              let lastId = parseInt(this.playlists[this.playlists.length - 1].id.substring(8));
              let newPlaylist = {
                id: `playlist${lastId + 1}`,
                name: data.title,
                noWords: 0,
              };
              this.dbService.addPlaylist(newPlaylist);
            }
          }
        }
      ]
    });
    prompt.present();
  }

  deletePlaylist(playlist) {
    this.dbService.deletePlaylist(playlist);
  }

  editPlaylist(playlist) {
    let prompt = this.alertCtrl.create({
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
    prompt.present();
  }
}
