import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'feedback-page.html',
})
export class FeedbackPage {

  constructor(private alertCtrl: AlertController, private translate: TranslateService) {
  }

  displayAuthor() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('Author_info'),
      subTitle: `
        <strong>TechyBrain</strong><br />
        <strong>Email:</strong> techybraingroup@gmail.com<br />
        <strong>Website:</strong> toithacmac.wordpress.com
      `,
    });
    alert.present();
  }
}
