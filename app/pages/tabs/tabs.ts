import {Component} from '@angular/core'
import {HomePage} from '../home-page/home-page';
import {ContactPage} from '../contact-page/contact-page';
import {UnitsPage} from '../units-page/units-page';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  private tab1Root: any;
  private tab3Root: any;
  private tabUnits: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = HomePage;
    this.tab3Root = ContactPage;
    this.tabUnits = UnitsPage;
  }
}
