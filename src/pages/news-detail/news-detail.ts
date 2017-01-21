import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  templateUrl: 'news-detail.html',
})
export class NewsDetail {
  news: any = {};

  constructor(private navParams: NavParams) {
    this.news = this.navParams.data.selectedNews;
  }
}
