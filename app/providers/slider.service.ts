import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';

@Injectable()
export class SliderService {
  firstTime: boolean;

  constructor() {

  }

  resetSlider() {
    this.firstTime = true;
  }
}

