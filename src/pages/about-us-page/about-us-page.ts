import { Component } from '@angular/core';
import { AlertController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  template: `
    <ion-content>
      Author Info
    </ion-content>
  `
})
export class AuthorInfo {
  constructor() {
  }
}

@Component({
  templateUrl: 'about-us-page.html',
})
export class AboutUsPage {
  constructor(private alertCtrl: AlertController, private modalCtrl: ModalController,
    private translate: TranslateService) {
  }

  openIntroduction() {
    let authorInfoModal = this.modalCtrl.create(AuthorInfo);
    authorInfoModal.present();
  }

  openContact() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('Contact'),
      subTitle: `
        <strong>TechyBrain</strong><br />
        <strong>Email:</strong> techybraingroup@gmail.com<br />
        <strong>Website:</strong> toithacmac.wordpress.com
      `,
    });
    alert.present();
  }
}
