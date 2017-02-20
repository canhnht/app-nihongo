import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

@Component({
  templateUrl: 'tab-news-content.html',
})
export class TabNewsContent {
  news: any = {};

  constructor(private navParams: NavParams, private navCtrl: NavController) {
    this.news = this.navParams.data;
  }

  goBack() {
    this.navCtrl.parent.viewCtrl.dismiss();
  }
}
