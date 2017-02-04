import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'about-us-page.html',
})
export class AboutUsPage {

  constructor(private alertCtrl: AlertController, private translate: TranslateService) {
  }
}
