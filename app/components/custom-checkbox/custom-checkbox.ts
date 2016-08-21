import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';

@Component({
  selector: 'custom-checkbox',
  templateUrl: 'build/components/custom-checkbox/custom-checkbox.html',
  directives: [IONIC_DIRECTIVES],
})
export class CustomCheckbox {
  @Input() checked: boolean;
  @Output() onClick = new EventEmitter();
  id: string;

  constructor() {
    this.id = this.makeid();
  }

  clickLabel($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.onClick.emit($event);
  }

  private makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}
