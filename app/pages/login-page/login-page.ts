import {Component} from '@angular/core';
import {NavController, MenuController, Modal} from 'ionic-angular';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import {AuthService} from '../../services/auth.service';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {SelectedWords} from '../../components/selected-words/selected-words';
import {CustomDatePipe} from '../../custom-date.pipe';

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
  directives: [CustomCheckbox, AudioSetting],
  pipes: [CustomDatePipe],
})
export class LoginPage {
  isChecked: boolean = false;
  items = [
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 1,
    },
  ];
  tabPage = "home";

  constructor(private navController: NavController, private menu: MenuController) {
    // this.menu.open();
  }

  toggleCheck() {
    console.log('toggleCheck');
    this.isChecked = !this.isChecked;
  }

  test($event, item) {
    item.checked = !item.checked;
    $event.stopPropagation();
  }

  testClick($event) {
    console.log($event);
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    console.log('test event');
  }

  getItems($event) {
    console.log('getItems', $event.value);
  }

  testModal() {
    // let profileModal = Modal.create(SelectedWords);
    // this.navController.present(profileModal);
    this.items.forEach(e => e.lastPlayed = Date.now());
  }
}
