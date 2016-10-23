import {Component, ViewChild} from '@angular/core';
import {ViewController, NavController, MenuController, Modal, Slides} from 'ionic-angular';
import {Toast, Facebook, GooglePlus} from 'ionic-native';
import {AuthService} from '../../services/auth.service';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
import {SelectedWords} from '../../components/selected-words/selected-words';
import {CustomDatePipe} from '../../custom-date.pipe';

@Component({
  templateUrl: 'build/pages/login-page/login-page.html',
  directives: [CustomCheckbox, AudioSetting],
  pipes: [CustomDatePipe],
})
export class LoginPage {
  @ViewChild('questionSlider') questionSlider: Slides;

  sliderOptions: any = {
    loop: true,
  };


  isChecked: boolean = false;
  items = [
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    },
    {
      title: '郵便番号',
      checked: false,
      lastPlayed: Date.now(),
      timesPlayed: 0,
    }
  ];
  tabPage = "search";

  data = {
    currentLevel: 2
  };

  constructor(private navController: NavController, private menu: MenuController) {
    // this.menu.open();
  }

  toggleCheck() {
    console.log('toggleCheck');
    this.isChecked = !this.isChecked;
  }

  test($event, item) {
    item.checked = !item.checked;
    $event.stopPropagation();
  }

  testClick($event) {
    console.log($event);
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    console.log('test event');
  }

  getItems($event) {
    console.log('getItems', $event.value);
  }

  testModal() {
    // let profileModal = Modal.create(SelectedWords);
    // this.navController.present(profileModal);
    this.items.forEach(e => e.lastPlayed = Date.now());
  }

  prev() {
    this.questionSlider.slidePrev();
  }

  next() {
    this.questionSlider.slideNext();
  }

  onSlideChanged($event) {
    Toast.showLongBottom('onSlideChanged').subscribe(() => {});
  }

  clickSlide() {
    console.log('click');
    this.isChecked = true;
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
