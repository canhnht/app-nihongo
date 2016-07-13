import {Component} from '@angular/core';
import {Platform, ionicBootstrap, MenuController} from 'ionic-angular';
import {StatusBar, Splashscreen, Toast} from 'ionic-native';
import {HomePage} from './pages/home-page/home-page';
import {PlaylistsPage} from './pages/playlists-page/playlists-page';
import {AudioService} from './services/audio.service';
import {SliderService} from './services/slider.service';
import {CourseService} from './services/course.service';
import {WordSlides} from './pages/word-slides/word-slides';
import {Loader} from './components/loader/loader';
import {LoaderService} from './services/loader.service';

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  homePage = HomePage;
  playlistsPage = PlaylistsPage;
  rootPage = HomePage;

  constructor(private platform: Platform, private menuController: MenuController) {
    this.platform.ready()
      .then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
      })
  }

  openPage(page) {
    this.rootPage = page;
  }
}

ionicBootstrap(MyApp, [AudioService, SliderService, CourseService, LoaderService]);
