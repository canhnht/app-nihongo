import {Component} from '@angular/core';
import {NavController, MenuController} from 'ionic-angular';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import {AuthService} from '../../services/auth.service';

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
})
export class LoginPage {
  constructor(private navController: NavController, private menu: MenuController) {
    // this.menu.open();
  }

  test() {
    console.log('test');
  }
}
