import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

/*
  Generated class for the UnitPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-unit-page',
  templateUrl: 'unit-page.html'
})
export class UnitPage {
  mySlideOptions: any;
  @ViewChild('modControl') modControl: Slides;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mySlideOptions = {
      slidesPerView: 1,
      loop: true
    };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnitPagePage');
  }

  prev() {
    this.modControl.slidePrev();
  }

  next() {
    this.modControl.slideNext();
  }

}
