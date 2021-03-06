import { Component } from '@angular/core';
import { AlertController, ViewController, NavParams } from 'ionic-angular';
import { Toast } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { DbService } from '../../services';

@Component({
  templateUrl: 'playlist-options.html',
})
export class PlaylistOptions {
  playlists: any[] = [];
  playlistsSubscription: Subscription;
  currentWord: any;

  constructor(private viewCtrl: ViewController, private dbService: DbService,
    private alertCtrl: AlertController, private navParams: NavParams,
    private translate: TranslateService) {
    this.currentWord = this.navParams.data.currentWord;
  }

  ionViewWillEnter() {
    this.dbService.getPlaylistsByWordId(this.currentWord.id);
    this.playlistsSubscription = this.dbService.playlistsByWordIdSubject.subscribe(
      (playlists) => this.playlists = playlists.map((item) => Object.assign({
        selected: item.checked
      }, item))
    );
  }

  ionViewWillLeave() {
    this.playlistsSubscription.unsubscribe();
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
          handler: data => {
            let searchIndex = this.playlists.findIndex(item => item.name == data.title);
            if (searchIndex >= 0)
              Toast.showShortCenter(this.translate.instant('Duplicate_playlist_message')).subscribe(() => {});
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

  close() {
    this.viewCtrl.dismiss();
  }

  save() {
    let isBookmarked = false;
    let diffPlaylists = this.playlists.filter((item) => {
      if (item.selected) isBookmarked = true;
      return item.checked !== item.selected;
    });
    this.viewCtrl.dismiss({ diffPlaylists, isBookmarked });
  }

  togglePlaylist(playlist) {
    playlist.selected = !playlist.selected;
  }
}
