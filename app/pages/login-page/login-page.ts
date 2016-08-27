import {Component} from '@angular/core';
import {NavController, MenuController, Modal} from 'ionic-angular';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import {AuthService} from '../../services/auth.service';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
  directives: [CustomCheckbox, AudioSetting],
})
export class LoginPage {
  isChecked: boolean = false;
  items = [
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    },
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    },
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    },
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    },
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    },
    {
      title: 'item1',
      checked: false
    },
    {
      title: 'item2',
      checked: false
    }
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
    let profileModal = Modal.create(PlaylistOptions);
    this.navController.present(profileModal);
  }
}
