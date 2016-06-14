import {Component} from '@angular/core'
import {HomePage} from '../home-page/home-page';
import {UnitsPage} from '../units-page/units-page';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  private tab1Root: any;
  private tabUnits: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = HomePage;
    this.tabUnits = UnitsPage;
  }
}
