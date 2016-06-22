import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LIST_COURSE} from '../../providers/list-course.data';
import {Course} from '../../providers/course.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';
import {UnitsPage} from '../units-page/units-page';
import {AudioService} from '../../providers/audio.service';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [BottomAudioController],
})
export class HomePage {
  courses: Course[];
  selectedCourseId: number = 0;

  constructor(private _navController: NavController, private _audioService: AudioService) {
    this.courses = LIST_COURSE;
    console.log(this._audioService);
  }

  selectCourse(course) {
    if (this.selectedCourseId == course.id)
      this.selectedCourseId = 0;
    else
      this.selectedCourseId = course.id;

    console.log(this._audioService.data);
    if (this.selectedCourseId > 0)
      this._audioService.playCourse(course);
  }

  goToCourse($event, course) {
    this._navController.push(UnitsPage, {selectedCourse: course});
    $event.stopPropagation();
  }

  downloadCourse($event, course) {
    console.log('download', course);
    course.downloading = true;
    $event.stopPropagation();

    // set timeout for completing download
    setTimeout(() => {
      course.downloading = false;
      course.percentDownloaded = 100;
    }, 2000);
  }

  deleteCourse($event, course) {
    console.log('delete', course);
    course.percentDownloaded = 0;
    $event.stopPropagation();
  }
}
