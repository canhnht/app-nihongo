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
import {GameMissingInfo} from '../game-missing-info/game-missing-info';

@Component({
  templateUrl: 'build/pages/game-page/game-page.html',
})
export class GamePage {
  games = [
    {
      name: 'Vòng lặp trắc nghiệm',
      page: GameMultipleChoice,
      level: 0
    },
    {
      name: 'Tìm thông tin còn thiếu',
      page: GameMissingInfo,
      level: 0
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
