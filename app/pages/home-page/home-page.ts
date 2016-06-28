import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LIST_COURSE} from '../../providers/list-course.data';
import {Course} from '../../providers/course.interface';
import {BottomAudioController} from '../../components/bottom-audio-controller/bottom-audio-controller';
import {UnitsPage} from '../units-page/units-page';
import {AudioService} from '../../providers/audio.service';
import {VocabularySlides} from '../vocabulary-slides/vocabulary-slides';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [BottomAudioController],
})
export class HomePage {
  courses: Course[];

  constructor(private _navController: NavController, private _audioService: AudioService) {
    this.courses = LIST_COURSE;
  }

  selectCourse(course) {
    this._audioService.playCourse(course);
    this._navController.push(VocabularySlides,
      {title: 'Course 1 - Unit 1'});
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
