import {Component} from '@angular/core';
import {NavController, NavParams, Popover, Loading, Alert, Modal} from 'ionic-angular';
import {Subscription} from 'rxjs';
import {Toast, SpinnerDialog, NativeAudio} from 'ionic-native';
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
import {ExploreJapanRound} from '../explore-japan-round/explore-japan-round';

@Component({
  templateUrl: 'build/pages/game-explore-japan/game-explore-japan.html',
})
export class GameExploreJapan {
  data: any = {};
  dataSubscription: Subscription;
  roundLabels = ['一','二','三','四','五','六','七','八','九'];
  iter = [
    [],
    [0],
    [0,0],
    [0,0,0]
  ];

  constructor(private navController: NavController, private translate: TranslateService,
    private dbService: DbService) {

  }

  ionViewWillEnter() {
    this.dbService.getGameExploreJapan().then(data => {
      this.data = data;
    });
    this.dataSubscription = this.dbService.gameExploreJapanSubject.subscribe(
      data => this.data = data
    );
  }

  ionViewWillLeave() {
    this.dataSubscription.unsubscribe();
  }

  ionViewDidEnter() {
    SpinnerDialog.hide();
  }

  playRound(topic, roundNumber) {
    NativeAudio.play('touch', ()=>{});
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.navController.push(ExploreJapanRound, {topic, roundNumber});
  }

  close() {
    NativeAudio.play('touch', ()=>{});
    this.navController.pop();
  }
}
