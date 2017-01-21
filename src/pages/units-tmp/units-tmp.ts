import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { SpinnerDialog } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DbService, SettingService } from '../../services';
import { WordsPage } from '../words-page/words-page';
import { getRandomQuiz } from '../../helpers/main-helper';

@Component({
  selector: 'page-units-tmp',
  templateUrl: 'units-tmp.html'
})
export class UnitsTmpPage {

  units: any[] = [];
  course: any = {};
  currentUnit: any = {};
  sttUnit = {
    OPEN: 0,
    LOCK: 1,
    CURRENT: 2,
    PASS: 3
  }

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService, private alertCtrl: AlertController, private translate: TranslateService, private settingService: SettingService) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.loadUnitPage(false);
  }

  checkStatus(unit){
    let stt = unit.state;

    if(this.isOpen(stt)){
      
      let listUpdateUnits = this.units.filter((item) => item.id !== unit.id);

      let promiseUpdateUnit =  this.updateStateUnit(unit.id, this.sttUnit.CURRENT);
      let promiseUpdateListUnits = listUpdateUnits.map((unit) => {
        return this.updateStateUnit(unit.id, this.sttUnit.LOCK);
      })

      Promise.all([promiseUpdateUnit, promiseUpdateListUnits])
      .then(()=>{
        this.loadUnitPage(true);
      })

      return;
    }

    if(this.isLock(stt)){
      
      let alert = this.alertCtrl.create({
      title: 'Kiểm tra',
      subTitle: 'Hãy làm bài test để chắc chắn bạn đã sẵn sàng cho Unit mới!',
      buttons: [
        {
          text: 'Huỷ bỏ',
          handler: () => {}
        },
        {
          text: 'Đồng ý',
          handler: () => {
            SpinnerDialog.show(this.translate.instant('Processing'),this.translate.instant('Please_wait'), false);
            this.dbService.getWordsByUnitId(unit.id).then((words) => {
            this.navCtrl.push(getRandomQuiz(), {
              words,
              onFail: () => {},
              onPass: () => {
                let promiseUpdateNewUnit = this.updateStateUnit(unit.id, this.sttUnit.CURRENT);
                let promiseUpdateOldUnit = this.updateStateUnit(this.currentUnit.id, this.sttUnit.PASS);
                
                Promise.all([promiseUpdateNewUnit, promiseUpdateOldUnit])
                .then(()=>{
                  this.loadUnitPage(true);
                  this.goToUnit(unit);
                })
              },
            });
          });
          }
        }
      ]
      })

      alert.present();
      return;
    }

    if(this.isPass(stt) || this.isCurrent(stt)){
      this.goToUnit(unit);
      return;
    }
  }

  private loadUnitPage(firsttime){
    this.dbService.getUnitsByCourseId(this.course.id).then(units => {
      this.units = units;
      let currentUnit = units.filter((item) => item.state == this.sttUnit.CURRENT);
      this.currentUnit =  currentUnit ? currentUnit[0] : null;
      if(!this.currentUnit && firsttime) {
         let alert = this.alertCtrl.create({
            title: 'Hướng dẫn:',
            subTitle: 'Vui lòng chọn một unit bạn muốn bắt đầu!',
            buttons: [
              {
                text: 'Đã hiểu',
              }
            ]
          })
          alert.present();
      }
    })
  }

  private updateStateUnit(unitId, state){
    let unit = {
      id : unitId,
      state: state
    }
    return this.dbService.updateStateOfUnit(unit);
  }

  private goToUnit(unit) {
    this.settingService.reset(true);
    this.navCtrl.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: this.course,
    });
  }

  private isPassedExam(){
    return true;
  }

  isPass(stt){
    return stt == this.sttUnit.PASS;
  }

  isCurrent(stt){
    return stt == this.sttUnit.CURRENT;
  }

  isOpen(stt){
    return stt == this.sttUnit.OPEN;
  }

  isLock(stt){
    return stt ==  this.sttUnit.LOCK;
  }
}
