import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LIST_COURSE} from '../../providers/list-course.data';
import {Course} from '../../providers/course.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [BottomAudioController],
})
export class HomePage {
  private courses: Course[];

  constructor(private _navController: NavController) {
    this.courses = LIST_COURSE;
  }

  selectCourse(course) {
    console.log(course);
  }

  playCourse($event, course) {
    console.log('play', course);
    $event.stopPropagation();
  }
}
