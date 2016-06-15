import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html'
})
export class HomePage {
  constructor(private _navController: NavController) {
  }

  goToFactsPage(){
  }

  doRefresh(refresher) {
    console.log('refresh');
    setTimeout(() => {
        console.log('time out');
        refresher.complete();
    }, 2000);
  }
}
