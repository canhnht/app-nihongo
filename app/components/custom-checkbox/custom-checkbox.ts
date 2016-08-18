import {Component, Input} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';

@Component({
  selector: 'custom-checkbox',
  templateUrl: 'build/components/custom-checkbox/custom-checkbox.html',
  directives: [IONIC_DIRECTIVES],
})
export class CustomCheckbox {
  @Input() checked: boolean = false;

  constructor() {
  }
}
