import {Component} from '@angular/core';
import {ViewController, NavController, NavParams, Alert, Modal} from 'ionic-angular';
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
  data = {
    currentLevel: 1
  };

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

  openGameRule() {
    let modal = Modal.create(GameMultipleChoiceRules);
    this.navController.present(modal);
  }

  openAchievements() {
    let modal = Modal.create(GameMultipleChoiceAchievements);
    this.navController.present(modal);
  }

  closeGame() {
    this.navController.pop();
  }

  resetGame() {
    this.data.currentLevel = 1;
    // Update db
  }
}


@Component({
  template: `
    <ion-content class="multiple-choice-rules">
      <button clear danger round large class="btn-close"
        (click)="close()">
        <ion-icon name="close"></ion-icon>
      </button>
      <div class="instruction">
        <div class="title">
          Hướng dẫn chơi
        </div>
        <p>Mỗi cấp độ sẽ có một lượng câu hỏi để người chơi trả lời</p>
        <p>Nếu trong 1 lượt chơi, người chơi trả lời sai một câu hỏi thì sẽ phải trả lời lại từ đầu tất cả câu hỏi trong cấp độ đó</p>
        <p>Người chơi vượt qua một cấp độ khi đã trả lời đúng tất cả các câu hỏi chỉ trong một lượt chơi</p>
        <p>Nội dung câu hỏi được lấy từ các khóa học đã tải</p>
      </div>
    </ion-content>
  `,
})
class GameMultipleChoiceRules {

  constructor(private viewController: ViewController, private navController: NavController) {
  }

  close() {
    this.viewController.dismiss();
  }

}



@Component({
  template: `
    <ion-content class="multiple-choice-achievements">
      <button clear danger round large class="btn-close"
        (click)="close()">
        <ion-icon name="close"></ion-icon>
      </button>
      <div class="title">
        Thành tích của bạn
      </div>
      <ion-list [virtualScroll]="achievements">
        <ion-item text-wrap *virtualItem="let achievement">
          <ion-label class="achievement-item">
            <ion-badge class="achievement-level">{{achievement.level}}</ion-badge>
            <div class="achievement-desc">
              <h2>
                {{achievement.numberQuestions}} câu hỏi trong
                {{achievement.numberPlay}} lần chơi
              </h2>
              <p>{{achievement.date | date}}</p>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
class GameMultipleChoiceAchievements {
  achievements = [
    {
      level: 1,
      numberQuestions: 10,
      numberPlay: 1,
      date: new Date()
    },
    {
      level: 2,
      numberQuestions: 15,
      numberPlay: 10,
      date: new Date()
    },
    {
      level: 3,
      numberQuestions: 20,
      numberPlay: 5,
      date: new Date()
    }
  ];

  constructor(private viewController: ViewController, private navController: NavController) {
    this.sortAchievements();
  }

  sortAchievements() {
    this.achievements = this.achievements.sort((a1, a2) => {
      return a2.level - a1.level;
    });
  }

  close() {
    this.viewController.dismiss();
  }

}
