import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {AudioService} from './providers/audio.service';
import {SliderService} from './providers/slider.service';
import {VocabularySlides} from './pages/vocabulary-slides/vocabulary-slides';

declare var Media:any;

@Component({
  template: `
    <ion-nav [root]="rootPage"></ion-nav>
  `,
})
export class MyApp {

  private rootPage:any;

  constructor(private platform:Platform) {
    this.rootPage = VocabularySlides;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService]);
