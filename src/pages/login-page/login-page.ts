import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

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
