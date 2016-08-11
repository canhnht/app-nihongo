import {Injectable} from '@angular/core';
import {File, Toast} from 'ionic-native';
import * as utils from '../utils';
import {Subject, Observable} from 'rxjs';

declare var require: any;
let PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

@Injectable()
export class DbService {
  db: any;
  listCourse: any[] = null;
  listCourseSubject: Subject<any[]> = new Subject<any[]>();
  currentCourseSubject: Subject<any> = new Subject<any>();
  playlistSubject: Subject<any> = new Subject<any>();
  currentCourse: any = null;

  constructor() {
    this.db = new PouchDB('app-nihongo', {adapter: 'websql'});
    let dbFile = '_pouch_app-nihongo.txt';
    let dbDir = 'file:///android_asset/www/';
    File.readAsText(dbDir, dbFile)
      .then(result => {
        return this.db.get('_local/preloaded').then(doc => {
          this.listenForChange();
          return this.getListCourse()
            .then(listCourse => {
              this.listCourseSubject.next(listCourse);
            });
        })
        .catch(err => {
          if (err.name !== 'not_found') throw err;
          return this.db.load(result)
            .then(() => {
              this.listenForChange();
              this.getListCourse()
                .then(listCourse => {
                  this.listCourseSubject.next(listCourse);
                });
              return this.db.put({_id: '_local/preloaded'});
            });
        });
      })
      .catch(utils.errorHandler('Error loading database file'));
  }

  private listenForChange() {
    const onDatabaseChange = (change) => {
      if (change.deleted) return;
      let doc = change.doc;
      if (doc._id.startsWith('course')) {
        this.currentCourse = doc;
        this.currentCourseSubject.next(doc);
      } else if (doc._id.startsWith('playlist')) {
        this.playlistSubject.next(doc);
      }
    };
    this.db.changes({ live: true, since: 'now', include_docs: true })
      .on('change', onDatabaseChange);
  }

  getListCourse() {
    if (!this.listCourse) {
      return Promise.resolve(this.db.allDocs({
        include_docs: true,
        startkey: 'course',
        endkey: 'course\uffff'
      })).then(docs => {
          this.listCourse = docs.rows.map(row => {
            let course = row.doc;
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
          this.currentCourse = course;
          return course;
        })
        .catch(utils.errorHandler(`Error get course by id ${courseId}`));
    } else {
      return Promise.resolve(this.currentCourse);
    }
  }

  getAllPlaylists() {
    return Promise.resolve(this.db.allDocs({
        include_docs: true,
        startkey: 'playlist',
        endkey: 'playlist\uffff'
      }))
      .then(docs => {
        return docs.rows.map(row => row.doc);
      })
      .catch(utils.errorHandler('Error get all playlists'));
  }

  updateMultiplePlaylists(playlists) {
    this.db.bulkDocs(playlists)
      .then(resp => {})
      .catch(utils.errorHandler('Error update playlists'));
  }

  updateCourse(course) {
    this.db.put(course)
      .then(resp => {})
      .catch(utils.errorHandler('Error update course'));
  }

  addPlaylist(playlist) {
    this.db.put(playlist)
      .then(resp => {})
      .catch(utils.errorHandler('Error add playlist'));
  }

  deletePlaylist(playlist) {
    this.db.remove(playlist)
      .then(resp => {})
      .catch(utils.errorHandler('Error delete playlist'));
  }

  updatePlaylist(playlist) {
    this.db.put(playlist).then(resp => {}).catch(
      utils.errorHandler('Error update playlist')
    );
  }
}
