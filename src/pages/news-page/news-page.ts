import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { MediaPlugin, Network, Toast } from 'ionic-native';
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

  constructor(private navCtrl: NavController, private dbService: DbService,
    private http: Http, private translate: TranslateService, private loader: LoaderService) {
    this.dbService.getAllNews().then((listNews) => this.listNews = listNews);
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
}
