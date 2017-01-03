import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

/*
  Generated class for the WordPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-word-page',
  templateUrl: 'word-page.html'
})
export class WordPage {
  mySlideOptions: any;
  @ViewChild('modControl') modControl: Slides;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mySlideOptions = {
      slidesPerView:3,
      height: 5,
      loop: true,
      spaceBetween: 2,

    }
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
