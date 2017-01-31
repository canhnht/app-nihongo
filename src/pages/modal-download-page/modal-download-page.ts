import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { DownloadService } from '../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-modal-download-page',
  templateUrl: 'modal-download-page.html'
})
export class ModalDownloadPage {
  perDownloading: any = 0;
  percDownloadedSubscription: Subscription;
  course: any;

  constructor(public viewCtrl: ViewController, private downloadService: DownloadService,
    private navParams: NavParams) {
    this.course = this.navParams.get('course');
  }

  ionViewWillEnter(){
    this.perDownloading = Math.floor(this.downloadService.downloadedPercent);
    this.percDownloadedSubscription = this.downloadService.percDownloadedSubject.subscribe(
      ({ percDownloaded }) => {
        this.perDownloading = Math.floor(percDownloaded);
    });
  }

  ionViewWillLeave() {
    this.percDownloadedSubscription.unsubscribe();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
