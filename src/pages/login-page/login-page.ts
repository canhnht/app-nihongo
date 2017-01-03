import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { PlaylistOptions } from '../../components';

@Component({
  templateUrl: 'login-page.html',
})
export class LoginPage {
  flipped: boolean = false;

  constructor(private navCtrl: NavController,
    private modalCtrl: ModalController) {
  }

  flipCard() {
    this.flipped = !this.flipped;
  }
}
