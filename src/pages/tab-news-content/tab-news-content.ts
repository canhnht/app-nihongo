import { Component } from '@angular/core';
import { NavParams, NavController, App } from 'ionic-angular';

@Component({
  templateUrl: 'tab-news-content.html',
})
export class TabNewsContent {
  news: any = {};

  constructor(private navParams: NavParams, private navCtrl: NavController,
    private app: App) {
    this.news = this.navParams.data;
    alert(`check ${this.navCtrl.parent.viewCtrl} - ${this.navCtrl.parent.select}`);
    this.navCtrl.parent.select(1);
  }

  goBack() {
    this.app.getRootNav().pop();
  }
}
