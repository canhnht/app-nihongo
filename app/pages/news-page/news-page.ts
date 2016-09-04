import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Subscription} from 'rxjs';
import {Toast, Transfer, File, SpinnerDialog, MediaPlugin} from 'ionic-native';
import {NavController, Popover, Alert, NavParams, Modal} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {NewsDetail} from '../news-detail/news-detail';

@Component({
  templateUrl: 'build/pages/news-page/news-page.html',
})
export class NewsPage {
  listNews: any[] = [];
  media: MediaPlugin = null;

  constructor(private navController: NavController, private dbService: DbService,
    private navParams: NavParams, private http: Http) {
    this.dbService.getAllNews().then(listNews => {
      this.listNews = listNews.sort((n1, n2) => {
        let d1 = new Date(n1.date);
        let d2 = new Date(n2.date);
        return d2.getTime() - d1.getTime();
      })
    });
  }

  refreshNews() {
    SpinnerDialog.show('Đang tải tin tức mới',
      'Xin chờ 1 chút', false);
    this.http.get('http://52.11.74.221/nihongo/nhk').toPromise().then(resp => {
      this.listNews = resp.json();
      this.dbService.addOrUpdateNews(this.listNews.map(news => {
        return Object.assign({}, news, {
          _id: `news${news.id}`
        });
      }))
      SpinnerDialog.hide();
    }).catch(err => {
      Toast.showShortBottom(`Cannot download news ${JSON.stringify(err)}`).subscribe(() => {});
      SpinnerDialog.hide();
    });
  }

  playNews(news) {
    this.media = new MediaPlugin(news.voiceUrl);
    this.media.play();
  }

  newsDetail(news) {
    this.navController.push(NewsDetail, { selectedNews: news });
  }
}
