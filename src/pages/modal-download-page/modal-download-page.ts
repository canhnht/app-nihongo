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
  constructor(public viewCtrl: ViewController, private downloadService: DownloadService, public params: NavParams) {
    this.course = this.params.get('course');
    this.course.image = "assets/images/courses/N3Logo.png";
  }

  ionViewWillEnter(){
    this.percDownloadedSubscription = this.downloadService.percDownloadedSubject.subscribe(
      download => {
        this.perDownloading = download.percDownloaded;
    })
  }

  ionViewWillLeave() {
    this.percDownloadedSubscription.unsubscribe();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
