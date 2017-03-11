import { Component } from '@angular/core';
import { AlertController, ModalController, ViewController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  template: `
    <ion-header>
      <ion-navbar color="primary">
        <ion-title>{{'Intro_team' | translate}}</ion-title>
        <ion-buttons end>
          <button ion-button (click)="close()">
            {{'Close' | translate}}
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>

    <ion-content>
      TechyBrain
    </ion-content>
  `
})
export class AuthorInfo {
  constructor(private viewCtrl: ViewController) {
  }

  close() {
    this.viewCtrl.dismiss();
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
