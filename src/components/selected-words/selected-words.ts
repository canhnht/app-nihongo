import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { SettingService } from '../../services';

@Component({
  templateUrl: 'selected-words.html',
})
export class SelectedWords implements OnInit, OnDestroy {
  selectedWords: any[] = [];
  settingSubscription: Subscription;

  constructor(private viewCtrl: ViewController,
    private translate: TranslateService, private settingService: SettingService) {
  }

  ngOnInit() {
    this.selectedWords = [...this.settingService.selectedWords];
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        this.selectedWords = [...this.settingService.selectedWords];
        if (this.selectedWords.length === 0) this.close();
      }
    );
  }

  ngOnDestroy() {
    this.settingSubscription.unsubscribe();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  removeWord(word) {
    this.settingService.deleteSelectedWord(word.id);
  }
}
