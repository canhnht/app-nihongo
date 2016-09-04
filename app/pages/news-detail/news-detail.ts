import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Subscription} from 'rxjs';
import {Toast, Transfer, File, SpinnerDialog, MediaPlugin} from 'ionic-native';
import {NavController, Popover, Alert, NavParams, Modal} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {AudioBar} from '../../components/audio-bar/audio-bar';

@Component({
  templateUrl: 'build/pages/news-detail/news-detail.html',
  directives: [AudioBar],
})
export class NewsDetail {
  news: any = {};
  media: MediaPlugin = null;

  constructor(private navController: NavController, private dbService: DbService,
    private navParams: NavParams, private http: Http) {
    this.news = this.navParams.data.selectedNews;
  }
}
