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
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {GameMultipleChoiceService} from '../../services/game-multiple-choice.service';
import {MultipleChoiceSlides} from '../multiple-choice-slides/multiple-choice-slides';

@Component({
  templateUrl: 'build/pages/game-multiple-choice/game-multiple-choice.html',
})
export class GameMultipleChoice {

  constructor(private navController: NavController, private dbService: DbService,
    private translate: TranslateService, private storageService: LocalStorageService,
    private gameService: GameMultipleChoiceService) {
  }

  start() {
    if (this.gameService.generateListQuestion()) {
      SpinnerDialog.show(this.translate.instant('Processing'),
        this.translate.instant('Please_wait'), false);
      this.navController.push(MultipleChoiceSlides);
    } else {
      let alert = Alert.create({
        title: 'Không có câu hỏi',
        subTitle: 'Hãy tải khóa học về để tạo câu hỏi!',
        buttons: ['Đồng ý']
      });
      this.navController.present(alert);
    }
  }
}
