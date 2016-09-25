import {Component} from '@angular/core';
import {NavController, Alert, ViewController, NavParams} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {Toast} from 'ionic-native';
import {CustomCheckbox} from '../custom-checkbox/custom-checkbox';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription} from 'rxjs';

@Component({
  templateUrl: 'build/components/playlist-options/playlist-options.html',
  directives: [CustomCheckbox],
})
export class PlaylistOptions {
  playlists: any[] = [];
  playlistSubscription: Subscription;

  constructor(private viewController: ViewController, private dbService: DbService,
    private navController: NavController, private navParams: NavParams,
    private translate: TranslateService) {
    let currentWord = this.navParams.data.currentWord;
    this.dbService.getAllPlaylists()
      .then(allPlaylists => {
        this.playlists = allPlaylists;
        this.playlists.forEach(playlist => {
          playlist.checked = playlist.words.findIndex(e => e._id === currentWord._id) >= 0;
        });
      });
  }

  ionViewWillEnter() {
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

  close() {
    this.viewController.dismiss();
  }

  save() {
    let data = this.playlists.map((playlist, index) => index)
      .filter(index => this.playlists[index].checked);
    this.viewController.dismiss({
      data: data,
      playlists: this.playlists,
    });
  }

  togglePlaylist(playlist) {
    playlist.checked = !playlist.checked;
  }
}
