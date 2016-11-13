import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/explore-japan-round/explore-japan-round.html',
})
export class ExploreJapanRound {
  data: any = {};
  listWord: any[] = [];
  listCell: any[] = [];

  constructor(private navController: NavController, private translate: TranslateService,
    private dbService: DbService, private navParams: NavParams) {
    let topic = this.navParams.data.topic;
    this.dbService.getExploreJapanData().then(data => {
      this.data = data;
      this.listWord = this.generateListWord(this.data[topic]);
      this.listCell = this.generateListCell(topic, this.listWord);
      alert(JSON.stringify(this.listCell));
    });
  }

  generateListWord(words) {
    words = this.shuffleArray(words);
    let numberCells = 12;
    let numberWords = numberCells / 2;
    return words.slice(0, numberWords);
  }

  generateListCell(topic, words) {
    let cells = [];
    words.forEach((item, ind) => {
      cells.push({
        text: item.word,
        wordIndex: ind,
        flip: false
      });
      cells.push({
        imageUrl: `images/${topic}/${item.imageFile}`,
        wordIndex: ind,
        flip: false
      });
    });
    return this.shuffleArray(cells);
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i >= 0; --i) {
      let k = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[k];
      arr[k] = temp;
    }
    return arr;
  }

  close() {
    this.navController.pop();
  }
}
