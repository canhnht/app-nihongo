import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { SpinnerDialog, MediaPlugin, Network, Toast } from 'ionic-native';
import { NavController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService } from '../../services';
import { NewsDetail } from '../news-detail/news-detail';
import { NHK_URL } from '../../constants';

@Component({
  templateUrl: 'news-page.html',
})
export class NewsPage {
  listNews: any[] = [];
  media: MediaPlugin = null;

  constructor(private navCtrl: NavController, private dbService: DbService,
    private http: Http, private translate: TranslateService) {
    this.dbService.getAllNews().then((listNews) => this.listNews = listNews);
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  refreshNews(refresher) {
    if (Network.type === 'none' || Network.type === 'unknown') {
      refresher.complete();
      return;
    }
    this.http.get(NHK_URL).toPromise().then((res) => {
      this.listNews = res.json();
      return this.dbService.addOrUpdateNews(this.listNews).then(() => {
        refresher.complete();
      });
    }).catch(err => {
      refresher.complete();
      Toast.showShortBottom(this.translate.instant('Download_news_error')).subscribe(() => {});
    });
  }

  playNews(news) {
    this.media = new MediaPlugin(news.voiceUrl);
    this.media.play();
  }

  newsDetail(news) {
    this.navCtrl.push(NewsDetail, { selectedNews: news });
  }
}
