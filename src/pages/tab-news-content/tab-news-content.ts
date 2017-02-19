import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  templateUrl: 'tab-news-content.html',
})
export class TabNewsContent {
  news: any = {};

  constructor(private navParams: NavParams) {
    this.news = this.navParams.data;
  }
}
