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
import {GameMultipleChoice} from '../game-multiple-choice/game-multiple-choice';
import {GameExploreJapan} from '../game-explore-japan/game-explore-japan';

@Component({
  templateUrl: 'build/pages/game-page/game-page.html',
})
export class GamePage {
  games = [
    {
      name: 'Vòng lặp trắc nghiệm',
      page: GameMultipleChoice,
      level: 0,
      icon: 'images/question-loop-icon.jpg'
    },
    {
      name: 'Khám phá Nhật Bản',
      page: GameExploreJapan,
      level: 0,
      icon: 'images/explore-japan-icon.png'
    }
  ];

  constructor(private navController: NavController,
    private translate: TranslateService, private dbService: DbService) {
  }

  ionViewWillEnter() {
    this.dbService.getGameMultipleChoice().then(
      data => this.games[0].level = data.currentLevel
    );
  }

  playGame(game) {
    this.navController.push(game.page);
  }
}
