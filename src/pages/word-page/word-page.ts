import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides, PopoverController} from 'ionic-angular';
import { SettingWordPage } from '../setting-word-page/setting-word-page'
/*
  Generated class for the WordPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  template: `<ion-list>
  <ion-item>
      <ion-checkbox checked="true" item-right></ion-checkbox>
      <ion-label>Select all</ion-label>
  </ion-item>
  <button ion-item [navPush]="pushPage">
    Settings
    <ion-icon name="settings" item-right></ion-icon>
  </button>
</ion-list>`
})

export class PopoverWordPage {
  pushPage: any;
  constructor(){
    this.pushPage = SettingWordPage;
  }
}


@Component({
  selector: 'page-word-page',
  templateUrl: 'word-page.html'
})
export class WordPage {
  mySlideOptions: any;
  @ViewChild('modControl') modControl: Slides;

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController) {
    this.mySlideOptions = {
      slidesPerView: 1,
      loop: true
    };
  }

  presentPopoverSetting(ev){
    let popover = this.popoverCtrl.create(PopoverWordPage);
    popover.present({
      ev: ev
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WordPagePage');
  }

  prev() {
    this.modControl.slidePrev();
  }

  next() {
    this.modControl.slideNext();
  }

}
