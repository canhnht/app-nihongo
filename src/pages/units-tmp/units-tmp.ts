import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DbService } from '../../services';
import { WordsPage } from '../words-page/words-page';

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
    private dbService: DbService, private alertCtrl: AlertController) {
    this.course = this.navParams.data.selectedCourse;
  }

  ionViewWillEnter() {
    this.loadUnitPage();
    this.currentUnit
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
        this.loadUnitPage();
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
            if(this.isPassedExam()){
              let promiseUpdateNewUnit = this.updateStateUnit(unit.id, this.sttUnit.CURRENT);
              let promiseUpdateOldUnit = this.updateStateUnit(this.currentUnit.id, this.sttUnit.PASS);
              
              Promise.all([promiseUpdateNewUnit, promiseUpdateOldUnit])
              .then(()=>{
                this.loadUnitPage();
              })
            }
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

  private loadUnitPage(){
    this.dbService.getUnitsByCourseId(this.course.id).then(units => {
      this.units = units;
      let currentUnit = units.filter((item) => item.state == this.sttUnit.CURRENT);
      this.currentUnit =  currentUnit ? currentUnit[0] : null;
      if(!this.currentUnit) {
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
