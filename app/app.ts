import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {CourseService} from './services/course.service';
import {WordSlides} from './pages/word-slides/word-slides';

@Component({
  template: `
    <ion-nav [root]="rootPage"></ion-nav>
  `,
})
export class MyApp {

  private rootPage:any;

  constructor(private platform:Platform) {
    this.rootPage = HomePage;

    platform.ready()
      .then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
      })
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService, CourseService]);
