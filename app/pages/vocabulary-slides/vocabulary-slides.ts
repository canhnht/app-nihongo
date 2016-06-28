import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

/*
  Generated class for the VocabularySlidesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/vocabulary-slides/vocabulary-slides.html',
  directives: [BottomAudioController],
})
export class VocabularySlides {
  sliderOptions: any = {
    autoplay: 1000,
    loop: true
  };
  title: String = 'Mimi Kara Nihongo';

  constructor(private _navController: NavController, private navParams: NavParams) {
    this.title = this.navParams.data.title;
  }
}
