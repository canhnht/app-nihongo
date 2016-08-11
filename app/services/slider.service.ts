import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs';

@Injectable()
export class SliderService {
  firstTime: boolean;
  currentSlide: number = -1;

  constructor() {

  }

  resetSlider() {
    this.firstTime = true;
    this.currentSlide = 1;
  }
}

