import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Injectable()
export class LoaderService {
  loader: any = null;

  constructor(private loadingCtrl: LoadingController, private translate: TranslateService) {
  }

  show() {
    if (this.loader) this.hide();
    this.loader = this.loadingCtrl.create({
      content: this.translate.instant('Please_wait...')
    });
    this.loader.present();
  }

  hide() {
    this.loader.dismiss();
    this.loader = null;
  }
}
