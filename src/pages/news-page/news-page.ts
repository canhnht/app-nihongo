import { Component } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { MediaPlugin, Network } from 'ionic-native';
import { NavController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService, LoaderService } from '../../services';
import { NewsDetail } from '../news-detail/news-detail';
import { NHK_URL } from '../../helpers/constants';

@Component({
  templateUrl: 'news-page.html',
})
export class NewsPage {
  listNews: any[] = [];
  media: MediaPlugin = null;
  previousFetched: number = 0;
  nextFetched: number = 0;

  constructor(private navCtrl: NavController, private dbService: DbService,
    private http: Http, private translate: TranslateService, private loader: LoaderService) {
    this.dbService.getNewsFromDate(new Date().toISOString()).then((listNews) => {
      this.listNews = listNews;
      this.previousFetched = listNews.length;
      this.nextFetched = listNews.length;
    });
  }

  ionViewDidEnter() {
    this.loader.hide();
  }

  playNews(news) {
    this.media = new MediaPlugin(news.voiceUrl);
    this.media.play();
  }

  newsDetail(news) {
    this.navCtrl.push(NewsDetail, { selectedNews: news });
  }

  loadNews(infiniteScoll) {
    if (this.previousFetched === 0) {
      infiniteScoll.complete();
      return;
    }

    this.downloadOlderNews().then((listNews) => this.dbService.addOrUpdateNews(listNews))
      .then(() => {
        this.dbService.getNewsFromDate(this.listNews[this.listNews.length - 1].date).then((listNews) => {
          this.listNews = this.listNews.concat(listNews);
          this.previousFetched = listNews.length;
          infiniteScoll.complete();
        });
      }).catch(() => {
        this.dbService.getNewsFromDate(this.listNews[this.listNews.length - 1].date).then((listNews) => {
          this.listNews = this.listNews.concat(listNews);
          this.previousFetched = listNews.length;
          infiniteScoll.complete();
        });
      });
  }

  refreshNews(refresher) {
    if (this.nextFetched === 0) {
      refresher.complete();
      return;
    }

    this.downloadNewerNews().then((listNews) => this.dbService.addOrUpdateNews(listNews))
      .then(() => {
        this.dbService.getNewsToDate(this.listNews[0].date).then((listNews) => {
          this.listNews = listNews.concat(this.listNews);
          this.nextFetched = listNews.length;
          refresher.complete();
        });
      }).catch(() => {
        this.dbService.getNewsToDate(this.listNews[0].date).then((listNews) => {
          this.listNews = listNews.concat(this.listNews);
          this.nextFetched = listNews.length;
          refresher.complete();
        });
      });
  }

  downloadOlderNews() {
    if (Network.type === 'none' || Network.type === 'unknown') return Promise.reject(null);

    let params: URLSearchParams = new URLSearchParams();
    let currentDate = new Date(this.listNews[this.listNews.length - 1].date);
    params.set('fromDate', `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
    return this.http.get(NHK_URL, { search: params })
      .map((res) => res.json()).toPromise();
  }

  downloadNewerNews() {
    if (Network.type === 'none' || Network.type === 'unknown') return Promise.reject(null);

    let params: URLSearchParams = new URLSearchParams();
    let currentDate = new Date(this.listNews[0].date);
    params.set('toDate', `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
    return this.http.get(NHK_URL, { search: params })
      .map((res) => res.json()).toPromise();
  }
}
