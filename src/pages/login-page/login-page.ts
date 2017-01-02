import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { PlaylistOptions } from '../../components';

@Component({
  templateUrl: 'login-page.html',
})
export class LoginPage {
  constructor(private navCtrl: NavController,
    private modalCtrl: ModalController) {
    let modal = this.modalCtrl.create(PlaylistOptions);
    modal.present();
  }
}
