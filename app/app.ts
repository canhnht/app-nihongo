import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {AudioService} from './providers/audio.service';
import {SliderService} from './providers/slider.service';
import {CourseService} from './services/course.service';
import {VocabularySlides} from './pages/vocabulary-slides/vocabulary-slides';

@Component({
  template: `
    <ion-nav [root]="rootPage"></ion-nav>
  `,
})
export class MyApp {

  private rootPage:any;

  constructor(private platform:Platform, private courseService: CourseService) {
    this.rootPage = HomePage;

    platform.ready().then(() => {
      courseService.initDB();
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService, CourseService]);
