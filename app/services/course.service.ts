import {Injectable} from '@angular/core';
import {File, Toast} from 'ionic-native';
import * as utils from '../utils';
import {Subject, Observable} from 'rxjs';

declare var require: any;
let PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

@Injectable()
export class CourseService {
  db: any;
  listCourse: any[] = null;
  listCourseSubject: Subject<any[]> = new Subject<any[]>();
  currentCourse: any = null;

  constructor() {
    this.db = new PouchDB('app-nihongo', {adapter: 'websql'});
    let dbFile = '_pouch_app-nihongo.txt';
    let dbDir = 'file:///android_asset/www/';
    File.readAsText(dbDir, dbFile)
      .then(result => {
        return this.db.get('_local/preloaded').then(doc => {
          this.getListCourse()
            .then(listCourse => {
              this.listCourseSubject.next(listCourse);
            });
        })
        .catch(err => {
          if (err.name !== 'not_found') throw err;
          return this.db.load(result)
            .then(() => {
              this.getListCourse()
                .then(listCourse => {
                  this.listCourseSubject.next(listCourse);
                })
              return this.db.put({_id: '_local/preloaded'});
            });
        });
      })
      .catch(utils.errorHandler('Error loading database file'));
  }

  getListCourse() {
    if (!this.listCourse) {
      return Promise.resolve(this.db.allDocs({ include_docs: true }))
        .then(docs => {
          this.listCourse = docs.rows.map(row => {
            let course = row.doc;
            delete course.units;
            course.imageUrl = `images/${course.imageUrl}`;
            return course;
          });
          return this.listCourse;
        })
        .catch(utils.errorHandler('Error get list course'));
    } else {
      return Promise.resolve(this.listCourse);
    }
  }

  getCourse(courseId) {
    if (!this.currentCourse || this.currentCourse._id !== courseId) {
      return Promise.resolve(this.db.get(courseId))
        .then(course => {
          course.imageUrl = `images/${course.imageUrl}`;
          this.currentCourse = course;
          return course;
        })
        .catch(utils.errorHandler('Error get course by id'));
    } else {
      return Promise.resolve(this.currentCourse);
    }
  }
}
