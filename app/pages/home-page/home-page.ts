import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LIST_COURSE} from '../../providers/list-course.data';
import {Course} from '../../providers/course.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';
import {UnitsPage} from '../units-page/units-page';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [BottomAudioController],
})
export class HomePage {
  courses: Course[];
  selectedCourseId: number = 0;

  constructor(private _navController: NavController) {
    this.courses = LIST_COURSE;
  }

  selectCourse(course) {
    console.log('play', course);
    this.selectedCourseId = course.id;
  }

  goToCourse($event, course) {
    this._navController.push(UnitsPage, {selectedCourse: course});
    $event.stopPropagation();
  }

  downloadCourse($event, course) {
    console.log('download', course);
    course.downloading = true;
    $event.stopPropagation();
  }

  deleteCourse($event, course) {
    console.log('delete', course);
    course.percentDownloaded = 0;
    $event.stopPropagation();
  }
}
