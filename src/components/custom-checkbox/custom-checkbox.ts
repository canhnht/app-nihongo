import { Component, Input, Output, EventEmitter } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'custom-checkbox',
  templateUrl: 'custom-checkbox.html',
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
    return v4();
  }
}
