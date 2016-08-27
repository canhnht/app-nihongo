import {Component} from '@angular/core';
import {NavController, Alert, ViewController} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {Toast} from 'ionic-native';

@Component({
  templateUrl: 'build/components/playlist-options/playlist-options.html',
})
export class PlaylistOptions {
  // playlists: any[] = [];
  // selectedPlaylists: string[] = [];

  constructor(
    private viewController: ViewController, private dbService: DbService) {
    // this.courseService.getAllPlaylists()
    //   .then(allPlaylists => {
    //     this.playlists = allPlaylists;
    //   });
  }

  // checkPlaylist($event, playlist) {
  //   let index: number = this.selectedPlaylists.indexOf(playlist._id);
  //   if (index >= 0)
  //     this.selectedPlaylists.splice(index, 1);
  //   else
  //     this.selectedPlaylists.push(playlist._id);
  //   $event.stopPropagation();
  // }

  // addNewPlaylist() {
  //   let prompt = Alert.create({
  //     title: 'Add new playlist',
  //     inputs: [
  //       {
  //         name: 'title',
  //         placeholder: 'Enter new playlist name'
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //       },
  //       {
  //         text: 'Save',
  //         handler: data => {
  //           let searchIndex = this.playlists.findIndex(item => item.name == data.title);
  //           if (searchIndex >= 0)
  //             Toast.showShortCenter('Playlist name already exists! Please choose another name')
  //               .subscribe(() => {});
  //           else {
  //             let newPlaylist = {
  //               _id: `playlist${this.playlists.length + 1}`,
  //               name: data.title,
  //               listWordNumber: []
  //             };
  //             this.courseService.addPlaylist(newPlaylist);
  //           }
  //         }
  //       }
  //     ]
  //   });
  //   this.navController.present(prompt);
  // }

  close() {
    this.viewController.dismiss();
  }
}
