import {Component} from '@angular/core';
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
export class SelectedWords {
  selectedWords: any[] = [];

  constructor(private viewController: ViewController, private dbService: DbService,
    private navController: NavController, private navParams: NavParams,
    private translate: TranslateService, private settingService: SettingService) {
    this.selectedWords = [...this.settingService.selectedWords.reduce((result, listWord) => {
      return result.concat(listWord);
    }, [])];;
  }

  close() {
    this.viewController.dismiss();
  }

  removeWord(index) {
  }
}
