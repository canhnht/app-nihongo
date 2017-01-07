import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AuthService } from '../../services';

@Component({
  templateUrl: 'login-page.html',
})
export class LoginPage {
  flipped: boolean = false;
  userProfile: any;

  constructor(private navCtrl: NavController, private modalCtrl: ModalController,
    private authService: AuthService) {
  }

  loginWithFacebook() {
    this.authService.loginWithFacebook().then(() => {
      alert('login success');
    });
  }
}
