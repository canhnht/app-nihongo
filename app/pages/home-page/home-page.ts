import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {Toast} from 'ionic-native';
import {NavController, Popover, Alert} from 'ionic-angular';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {UnitsPage} from '../units-page/units-page';
import {DbService} from '../../services/db.service';

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
})
export class HomePage {
  courses: Object[];
  listCourseSubscription: Subscription;

  constructor(private navController: NavController, private dbService: DbService) {
    this.courses = this.dbService.listCourse;
    this.dbService.listCourseSubject.subscribe(
      listCourse => this.courses = listCourse);
  }

  ionViewWillEnter() {
    this.listCourseSubscription = this.dbService.listCourseSubject.subscribe(
      listCourse => this.courses = listCourse);
  }

  ionViewWillLeave() {
    this.listCourseSubscription.unsubscribe();
  }

  goToCourse($event, course) {
    this.navController.push(UnitsPage, {selectedCourse: course});
    $event.stopPropagation();
  }

  showAlert() {
    let alert = Alert.create({
      title: 'Sorry!',
      subTitle: 'This course is not available yet.',
      buttons: ['OK']
    });
    this.navController.present(alert);
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
