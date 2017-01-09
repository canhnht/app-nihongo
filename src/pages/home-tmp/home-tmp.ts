import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabHomePage } from '../tab-home-page/tab-home-page';
import { TabUserPage } from '../tab-user-page/tab-user-page';

/*
  Generated class for the HomeTmp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-home-tmp',
  templateUrl: 'home-tmp.html'
})
export class HomeTmpPage {
  homeTab: any;
  userTab: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.homeTab = TabHomePage;
    this.userTab = TabUserPage;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomeTmpPage');
  }

   checkCall() {
    console.log("ok....");
  }

}
