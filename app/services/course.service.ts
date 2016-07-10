import {Injectable} from '@angular/core';
import {File, Toast} from 'ionic-native';
import * as utils from '../utils';

declare var require: any;
let PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

@Injectable()
export class CourseService {
  db: any;
  listCourse: any = null;

  initDB() {
    this.db = new PouchDB('app-nihongo', {adapter: 'websql'});
    let success = result => {
      this.db.get('_local/preloaded').then(doc => {
        Toast.showShortCenter('database preloaded').subscribe(() => {});
      })
      .catch(err => {
        Toast.showShortCenter('load database').subscribe(() => {});
        if (err.name !== 'not_found') throw err;
        this.db.load(result)
          .then(() => {
            return this.db.put({_id: '_local/preloaded'});
          });
      });
    };
    let dbFile = '_pouch_app-nihongo.txt';
    let dbDir = 'file:///android_asset/www/';
    File.readAsText(dbDir, dbFile)
      .then(success)
      .catch(utils.errorHandler('Error reading database file'));
  }

  getListCourse() {
    if (!this.listCourse) {
      return Promise.resolve(this.db.allDocs({ include_docs: true }))
        .then(docs => {
          this.listCourse = docs.rows.map(row => {
            let course = row.doc;
            delete course.units;
            return course;
          });
          return this.listCourse;
        });
    } else {
      return Promise.resolve(this.listCourse);
    }
  }
}
