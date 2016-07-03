import {Component} from '@angular/core';
import {IONIC_DIRECTIVES, ViewController, NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'build/components/popover-menu/popover-menu.html',
  directives: [IONIC_DIRECTIVES],
})
export class PopoverMenu {
  menu: any[];

  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
    this.menu = this.navParams.data.menu;
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
