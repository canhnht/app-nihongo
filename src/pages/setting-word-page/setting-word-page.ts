import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the SettingWordPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-setting-word-page',
  templateUrl: 'setting-word-page.html'
})
export class SettingWordPage {
  modeDisplay: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
   this.modeDisplay = "kanji"; 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingWordPagePage');
  }

}
