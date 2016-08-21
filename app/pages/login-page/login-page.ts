import {Component} from '@angular/core';
import {NavController, MenuController} from 'ionic-angular';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import {AuthService} from '../../services/auth.service';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
  directives: [CustomCheckbox],
})
export class LoginPage {
  isChecked: boolean = false;
  items = ['item1', 'item2'];

  constructor(private navController: NavController, private menu: MenuController) {
    // this.menu.open();
  }

  toggleCheck() {
    console.log('toggleCheck');
    this.isChecked = !this.isChecked;
  }

  test($event) {
    console.log('test');
    $event.stopPropagation();
    // alert('test' + $event.target.attributes[0]);
  }

  testClick($event) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    console.log('testClick');
  }
}
