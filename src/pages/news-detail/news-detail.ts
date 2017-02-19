import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { TabNewsContent } from '../tab-news-content/tab-news-content';
import { TabNewsPhrases } from '../tab-news-phrases/tab-news-phrases';

@Component({
  templateUrl: 'news-detail.html',
})
export class NewsDetail {
  news: any = {};
  contentTab: any;
  phrasesTab: any;

  constructor(private navParams: NavParams) {
    this.contentTab = TabNewsContent;
    this.phrasesTab = TabNewsPhrases;
    this.news = this.navParams.data.selectedNews;
  }
}
