


import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

/*
  Generated class for the Playground page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-playground',
  templateUrl: 'playground.html'
})
export class PlaygroundPage {
  dupStartNodes: any;
  dupEndNodes: any;
  sliderOptions = {
    initialSlide: 1,
    loop: true
  };
  slides: any[];
  default_slides_indexes = [ -1, 0, 1 ];
  default_slides = [];
  direction: number = 0;
  head: number;
  tail: number;
  firstTime: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public zone: NgZone) {
    this.default_slides = this.default_slides_indexes.map((e) => this.makeSlide(e, {
      title: 'default slide'
    }));
    this.slides = [...this.default_slides];
    this.head = this.slides[0].nr;
    this.tail = this.slides[this.slides.length - 1].nr;
  }

  getColor(nr) {
    return nr % 2 === 0 ? '#8080c5' : '#80b280';
  }

  makeSlide(nr, data) {
    return Object.assign({
      nr: nr,
      color: this.getColor(nr)
    }, data);
  }

  getSlideIndex(activeIndex) {
    if (activeIndex === 1 || activeIndex === 4) return 0;
    if (activeIndex === 3 || activeIndex === 0) return 2;
    return 1;
  }

  onSlideChanged($event) {
    if (this.firstTime) return this.firstTime = false;

    let i = this.getSlideIndex($event.activeIndex);
    console.log($event.activeIndex, i);
    let previousIndex = i === 0 ? 2 : i - 1;
    let nextIndex = i === 2 ? 0 : i + 1;
    let newDirection = this.slides[i].nr > this.slides[previousIndex].nr ? 1 : -1;
    console.log(previousIndex, nextIndex);
    this.slides[newDirection > 0 ? nextIndex : previousIndex] = this.createSlideData(newDirection, this.direction);
    this.direction = newDirection;
    console.log(JSON.stringify(this.slides));
    // this.updateDuplicateNode();
  }

  updateDuplicateNode() {
    this.dupStartNodes = document.querySelectorAll(".slide-content-0");
    this.dupEndNodes = document.querySelectorAll(".slide-content-2");
    if (this.dupStartNodes.length !== 2 || this.dupEndNodes.length !== 2) return;
    this.dupStartNodes.item(1).innerHTML = this.dupStartNodes.item(0).innerHTML;
    this.dupStartNodes.item(1).style.backgroundColor = this.dupStartNodes.item(0).style.backgroundColor;
    this.dupEndNodes.item(0).innerHTML = this.dupEndNodes.item(1).innerHTML;
    this.dupEndNodes.item(0).style.backgroundColor = this.dupEndNodes.item(1).style.backgroundColor;
  }

  createSlideData(newDirection, oldDirection) {
    if (newDirection === 1) {
      this.tail = oldDirection < 0 ? this.head + 3 : this.tail + 1;
    } else {
      this.head = oldDirection > 0 ? this.tail - 3 : this.head - 1;
    }
    let nr = newDirection === 1 ? this.tail : this.head;
    if (this.default_slides_indexes.indexOf(nr) !== -1) {
      return this.default_slides[this.default_slides_indexes.indexOf(nr)];
    }
    return this.makeSlide(nr, {
      title: 'generated slide'
    });
  }

  ngAfterViewChecked() {
    this.updateDuplicateNode();
  }
}
