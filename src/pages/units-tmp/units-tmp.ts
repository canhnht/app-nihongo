import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from '../../services';
import { WordsPage } from '../words-page/words-page';

@Component({
  selector: 'page-units-tmp',
  templateUrl: 'units-tmp.html'
})
export class UnitsTmpPage {

  units: any[] = [];
  course: any = {};
  sttUnit = {
    LOCK: 'lock',
    OPEN: 'open',
    CURRENT: 'current',
    PASS: 'passed'
  }

  constructor(private navCtrl: NavController, private navParams: NavParams,
    private dbService: DbService) {
    // this.course = this.navParams.data.selectedCourse;
    this.units = [
      {
        status: 'open'
      },
      {
        status: 'lock'
      },
      {
        status: 'passed'
      },
      {
        status: 'current'
      }
    ]
  }

  ionViewWillEnter() {
    // this.dbService.getUnitsByCourseId(this.course.id)
    //   .then(units => this.units = units);
  }

  checkStatus(unit){
    let stt = unit.status;
    if(stt == 'open'){
      this.updateStatusUnit(unit).then(()=>{
        this.dbService.getUnitsByCourseId(this.course.id)
        .then(units => this.units = units);
      })
      return;
    }
    if(stt == 'lock'){
      
      return;
    }
    if(stt == 'passed' || stt == 'current'){
      this.goToUnit(unit);
      return;
    }
  }

  private updateStatusUnit(unit){
    return Promise.resolve();
  }

  private goToUnit(unit) {
    this.navCtrl.push(WordsPage, {
      selectedUnit: unit,
      selectedCourse: this.course,
    });
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
