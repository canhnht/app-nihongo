import { Injectable } from '@angular/core';

@Injectable()
export class SliderService {
  firstTime: boolean;
  currentSlide: number = -1;

  constructor() {
  }

  resetSlider() {
    this.firstTime = true;
    this.currentSlide = -1;
  }
}

