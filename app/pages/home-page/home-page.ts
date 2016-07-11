import {Component} from '@angular/core';
import {Toast} from 'ionic-native';
import {NavController, Popover, Alert} from 'ionic-angular';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {UnitsPage} from '../units-page/units-page';
import {CourseService} from '../../services/course.service';
import {LIST_COURSE} from '../../services/list-course.data';
import {WordSlides} from '../word-slides/word-slides';
import * as utils from '../../utils';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
})
export class HomePage {
  courses: Object[];

  constructor(private navController: NavController, private courseService: CourseService) {
    this.courseService.listCourseSubject.subscribe(
      listCourse => this.courses = listCourse
    );
  }

  goToCourse($event, course) {
    this.navController.push(UnitsPage, {selectedCourse: course});
    $event.stopPropagation();
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
    let confirm = Alert.create({
      title: `Buy course ${course.title}?`,
      message: 'Do you agree to buy this course? The transaction will be taken immediately.',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {}
        },
        {
          text: 'Agree',
          handler: () => {
            course.isFree = true;
          }
        }
      ]
    });
    this.navController.present(confirm);
  }
}
