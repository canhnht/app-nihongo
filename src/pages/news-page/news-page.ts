import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { SpinnerDialog, MediaPlugin } from 'ionic-native';
import { NavController, AlertController } from 'ionic-angular';
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
    private http: Http, private translate: TranslateService,
    private alertCtrl: AlertController) {
    this.dbService.getAllNews().then(listNews => this.listNews = listNews);
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  refreshNews() {
    SpinnerDialog.show(this.translate.instant('Downloading_news'),
      this.translate.instant('Please_wait'), false);
    this.http.get(NHK_URL).toPromise().then(resp => {
      this.listNews = resp.json();
      this.dbService.addOrUpdateNews(this.listNews);
      SpinnerDialog.hide();
    }).catch(err => {
      SpinnerDialog.hide();
      let alert = this.alertCtrl.create({
        title: 'Không thể tải tin tức',
        subTitle: 'Lỗi kết nối internet!',
        buttons: ['Đồng ý']
      });
      alert.present();
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
