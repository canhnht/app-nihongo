import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavController, Alert, ViewController, NavParams} from 'ionic-angular';
import {DbService} from '../../services/db.service';
import {SettingService} from '../../services/setting.service';
import {Toast} from 'ionic-native';
import {CustomCheckbox} from '../custom-checkbox/custom-checkbox';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription} from 'rxjs';

@Component({
  templateUrl: 'build/components/selected-words/selected-words.html',
  directives: [CustomCheckbox],
})
export class SelectedWords implements OnInit, OnDestroy {
  selectedWords: any[] = [];
  settingSubscription: Subscription;

  constructor(private viewController: ViewController, private dbService: DbService,
    private navController: NavController, private navParams: NavParams,
    private translate: TranslateService, private settingService: SettingService) {
  }

  ngOnInit() {
    this.selectedWords = [...this.settingService.selectedWords];
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => this.selectedWords = [...this.settingService.selectedWords]
    )
  }

  ngOnDestroy() {
    this.settingSubscription.unsubscribe();
  }

  close() {
    this.viewController.dismiss();
  }

  removeWord(word) {
    this.settingService.deleteSelectedWord(word._id);
  }
}
