import { Component } from '@angular/core';
import { NavParams, ViewController, Platform } from 'ionic-angular';
import { DownloadService } from '../../services';
import { Subscription } from 'rxjs';

declare var require: any;
let firebase = require('firebase');

@Component({
  selector: 'modal-download-page',
  templateUrl: 'modal-download-page.html'
})
export class ModalDownloadPage {
  perDownloading: any = 0;
  percDownloadedSubscription: Subscription;
  course: any;
  randomTip: string = '';
  tips: string[] = [];
  intervalRandomTip: any = null;
  unregisterBackButton: any = null;

  constructor(public viewCtrl: ViewController, private downloadService: DownloadService,
    private navParams: NavParams, private platform: Platform) {
    this.course = this.navParams.get('course');
    this.unregisterBackButton = this.platform.registerBackButtonAction(() => {
    }, 1000);
  }

  startTrackDownloadingTips() {
    firebase.database().ref('tips').on('value', (snapshot) => {
      let tips = snapshot.val();
      if (!tips) tips = [];
      this.tips = tips;
    });
  }

  stopTrackDownloadingTips() {
    firebase.database().ref('tips').off('value');
  }

  startGenerateRandomTip() {
    this.intervalRandomTip = setInterval(() => {
      this.randomTip = this.tips[Math.floor(Math.random() * this.tips.length)] || '';
    }, 5000);
  }

  stopGenerateRandomTip() {
    if (this.intervalRandomTip) {
      clearInterval(this.intervalRandomTip);
      this.intervalRandomTip = null;
    }
  }

  ionViewWillEnter(){
    this.perDownloading = Math.floor(this.downloadService.downloadedPercent);
    this.percDownloadedSubscription = this.downloadService.percDownloadedSubject.subscribe(
      ({ percDownloaded }) => {
        this.perDownloading = Math.floor(percDownloaded);
    });
    this.startTrackDownloadingTips();
    this.startGenerateRandomTip();
  }

  ionViewWillLeave() {
    this.unregisterBackButton();
    this.percDownloadedSubscription.unsubscribe();
    this.stopTrackDownloadingTips();
    this.stopGenerateRandomTip();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
