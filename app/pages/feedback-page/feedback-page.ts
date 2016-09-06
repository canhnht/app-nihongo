import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog} from 'ionic-native';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioService} from '../../services/audio.service';
import {SliderService} from '../../services/slider.service';
import {DbService} from '../../services/db.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {WordSlides} from '../word-slides/word-slides';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/feedback-page/feedback-page.html',
})
export class FeedbackPage {

  constructor(private navController: NavController,
    private translate: TranslateService) {
  }

  displayAuthor() {
    let alert = Alert.create({
      title: this.translate.instant('Author_info'),
      subTitle: `
        <strong>TechyBrain</strong><br />
        <strong>Email:</strong> techybraingroup@gmail.com<br />
        <strong>Website:</strong> toithacmac.wordpress.com
      `,
    });
    this.navController.present(alert);
  }
}
