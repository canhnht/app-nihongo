import {Component, ViewChild, ApplicationRef} from '@angular/core';
import {NavController, NavParams, Slides} from 'ionic-angular';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

@Component({
  templateUrl: 'build/pages/vocabulary-slides/vocabulary-slides.html',
  directives: [BottomAudioController],
})
export class VocabularySlides {
  @ViewChild('vocabSlider') vocabSlider: Slides;
  sliderOptions: any = {
    initialSlide: 1,
    loop: true,
  };
  title: String = 'Mimi Kara Nihongo';
  slides: any[] = [];
  selectedSlide: number = 1;
  direction: number = 0;
  head: number;
  tail: number;
  default_slides_indexes: number[] = [ -1, 0, 1 ];
  default_slides: any[];
  firstChange: boolean = false;

  constructor(private _navController: NavController, private navParams: NavParams,
    private appRef: ApplicationRef) {
    this.title = this.navParams.data.title;

    var getColor = function ( nr ) {
      console.log('getColor', nr);
      return nr % 2 === 0 ? '#8080c5' : '#80b280';
    };

    this.default_slides = [
      this.makeSlide( this.default_slides_indexes[ 0 ], {
        title : 'default slide', color:  getColor( this.default_slides_indexes[ 0 ] ) }
      ),
      this.makeSlide( this.default_slides_indexes[ 1 ], {
        title : 'default slide', color:  getColor( this.default_slides_indexes[ 1 ] ) }
      ),
      this.makeSlide( this.default_slides_indexes[ 2 ], {
        title : 'default slide', color:  getColor( this.default_slides_indexes[ 2 ] ) }
      ),
    ];

    this.slides = [...this.default_slides];
    this.head = this.slides[0].nr;
    this.tail = this.slides[this.slides.length - 1].nr;
    console.log('check', this.head, this.tail);
  }

  makeSlide( nr, data ) {
    return Object.assign({}, data, {
      nr : nr
    });
  }

  previous() {
    this.vocabSlider.slidePrev();
  }

  next() {
    this.vocabSlider.slideNext();
  }

  onSlideChanged($event) {
    if (!this.firstChange) return this.firstChange = true;
    // console.log($event.activeIndex);
    let i = -1;
    let activeIndex = $event.activeIndex;
    if (activeIndex == 1 || activeIndex == 4) i = 0;
    else if (activeIndex == 2) i = 1;
    else i = 2;
    // console.log('iiiiiii', i);

    let previous_index = (i == 0 ? 2 : i - 1);
    let next_index = (i == 2 ? 0 : i + 1);
    let new_direction = this.slides[i].nr > this.slides[previous_index].nr ? 1 : -1;
    this.slides[new_direction > 0 ? next_index : previous_index] =
      this.createSlideData(new_direction, this.direction);
    this.direction = new_direction;
    setTimeout(() => {
      this.appRef.tick();
    }, 500);
  }

  createSlideData(new_direction, old_direction) {
    let nr;
    if (new_direction == 1) {
      this.tail = old_direction < 0 ? this.head + 3 : this.tail + 1;
    } else {
      this.head = old_direction > 0 ? this.tail - 3 : this.head - 1;
    }
    console.log(this.head, this.tail);
    nr = (new_direction == 1 ? this.tail : this.head);
    if (this.default_slides_indexes.indexOf(nr) !== -1) {
      return this.default_slides[this.default_slides_indexes.indexOf(nr)];
    }
    var getColor = function ( nr ) {
      console.log('getColor', nr);
      return nr % 2 === 0 ? '#8080c5' : '#80b280';
    };
    return this.makeSlide( nr, {
      title : 'generated slide', color:  getColor( nr ) }
    );
  }

  // onSlideChanged($event) {
  //   const TOTAL_VOCABULARIES = 10;
  //   let currentIndex = -1;
  //   let activeIndex = $event.activeIndex;
  //   if (activeIndex == 1 || activeIndex == 4) {
  //     currentIndex = 0;
  //   } else if (activeIndex == 2) {
  //     currentIndex = 1;
  //   } else if (activeIndex == 0 || activeIndex == 3) {
  //     currentIndex = 2;
  //   }
  //   let prevIndex = (currentIndex - 1 + 3) % 3;
  //   let nextIndex = (currentIndex + 1) % 3;
  //   console.group('test');
  //   console.log(prevIndex, currentIndex, nextIndex);
  //   console.log(this.slides[prevIndex].vocabIndex,
  //     this.slides[currentIndex].vocabIndex,
  //     this.slides[nextIndex].vocabIndex);
  //   console.groupEnd();

  //   this.slides[prevIndex].vocabIndex =
  //     (this.slides[currentIndex].vocabIndex - 1 + TOTAL_VOCABULARIES) % TOTAL_VOCABULARIES;
  //   this.slides[nextIndex].vocabIndex =
  //     (this.slides[currentIndex].vocabIndex + 1) % TOTAL_VOCABULARIES;
  // }

}
