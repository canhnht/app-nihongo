import {Component, NgZone} from '@angular/core';
import {File} from 'ionic-native';
import {NavController, Popover, Alert, Toast} from 'ionic-angular';
import {LIST_COURSE} from '../../providers/list-course.data';
import {Course} from '../../providers/course.interface';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {UnitsPage} from '../units-page/units-page';
import {AudioService} from '../../providers/audio.service';
import {SliderService} from '../../providers/slider.service';
import {CourseService} from '../../services/course.service';
import {VocabularySlides} from '../vocabulary-slides/vocabulary-slides';
import * as utils from '../../utils';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
})
export class HomePage {
  courses: Course[];

  constructor(private navController: NavController, private audioService: AudioService,
    private sliderService: SliderService, private courseService: CourseService,
    private zone: NgZone) {
    this.courses = LIST_COURSE;
  }

  goToCourse($event, course) {
    this.navController.push(UnitsPage, {selectedCourse: course});
    $event.stopPropagation();
  }

  goToSlides() {
    this.sliderService.resetSlider();
    if (this.audioService.isPlaying) {
      this.navController.push(VocabularySlides,
        {title: 'Course 2 - Unit 3'});
    }
  }

  presentPopover($event) {
    let popover = Popover.create(PopoverMenu, {
      menu: ['Setting']
    });
    this.navController.present(popover, {
      ev: $event
    });
  }

  buyCourse(course) {
    let success = result => {
      let confirm = Alert.create({
        title: 'abc',
        message: `${JSON.stringify(result)}`
      });
      this.navController.present(confirm);
    };

    this.courseService.getListCourse()
      .then(success)
      .catch(utils.errorHandler('Error getting list course'));
  }
}
