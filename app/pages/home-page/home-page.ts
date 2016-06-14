import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ScientificFactsPage} from '../scientific-facts-page/scientific-facts-page';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html'
})
export class HomePage {
  constructor(private _navController: NavController) {
  }

  goToFactsPage(){
    this._navController.push(ScientificFactsPage);
  }

  doRefresh(refresher) {
    console.log('refresh');
    setTimeout(() => {
        console.log('time out');
        refresher.complete();
    }, 2000);
  }
}
