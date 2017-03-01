import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AdMob, Network } from 'ionic-native';
import { TabHomePage } from '../tab-home-page/tab-home-page';
import { TabUserPage } from '../tab-user-page/tab-user-page';
import { AuthService } from '../../services';

@Component({
  templateUrl: 'home-page.html'
})
export class HomePage {
  homeTab: any;
  userTab: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private authService: AuthService) {
    this.homeTab = TabHomePage;
    this.userTab = TabUserPage;
  }

  ionViewWillEnter() {
    AdMob.hideBanner();
  }

  ionViewWillLeave() {
    if (Network.type === 'none' || Network.type === 'unknown') return;
    AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
  }
}
