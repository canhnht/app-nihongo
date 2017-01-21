import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabHomePage } from '../tab-home-page/tab-home-page';
import { TabUserPage } from '../tab-user-page/tab-user-page';

@Component({
  templateUrl: 'home-page.html'
})
export class HomePage {
  homeTab: any;
  userTab: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.homeTab = TabHomePage;
    this.userTab = TabUserPage;
  }
}
