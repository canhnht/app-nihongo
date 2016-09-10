import {Injectable} from '@angular/core';
import {File, Toast} from 'ionic-native';
import * as utils from '../utils';
import {Subject, Observable} from 'rxjs';

declare var require: any;
let PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

@Injectable()
export class DbService {
  db: any = null;
  listCourse: any[] = [];
  listCourseSubject: Subject<any[]> = new Subject<any[]>();
  currentCourseSubject: Subject<any> = new Subject<any>();
  playlistSubject: Subject<any> = new Subject<any>();
  currentCourse: any = {};
  currentPlaylist: any = {};
  currentPlaylistSubject: Subject<any> = new Subject<any>();
  listNews: any[] = [];
  listNewsSubject: Subject<any[]> = new Subject<any[]>();
  allCourses: any = {};
  allCoursesSubject: Subject<any[]> = new Subject<any[]>();

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
        this.allCourses[doc._id] = doc;
        this.allCoursesSubject.next(this.allCourses);
        let courseIndex = this.listCourse.findIndex(course => course._id === doc._id);
        this.listCourse[courseIndex] = doc;
        this.listCourseSubject.next(this.listCourse);
      } else if (doc._id.startsWith('playlist')) {
        this.playlistSubject.next(doc);
        if (doc._id === this.currentPlaylist._id)
          this.currentPlaylistSubject.next(doc);
      } else if (doc._id.startsWith('news')) {
        this.listNews.push(doc);
        this.listNews = this.listNews.sort((n1, n2) => {
          let d1 = new Date(n1.date);
          let d2 = new Date(n2.date);
          return d2.getTime() - d1.getTime();
        });
        this.listNewsSubject.next(this.listNews);
      }
    };
    this.db.changes({ live: true, since: 'now', include_docs: true })
      .on('change', onDatabaseChange);
  }

  getListCourse() {
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
    }).catch(utils.errorHandler('Error get list course'));
  }

  getAllCourses() {
    return Promise.resolve(this.db.allDocs({
      include_docs: true,
      startkey: 'course',
      endkey: 'course\uffff'
    })).then(docs => {
      this.allCourses = docs.rows.reduce((res, row) => {
        res[row.doc._id] = row.doc;
        return res;
      }, {});
      return this.allCourses;
    }).catch(utils.errorHandler('Error get all courses'));
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

  getPlaylist(playlistId) {
    if (!this.currentPlaylist || this.currentPlaylist._id !== playlistId) {
      return Promise.resolve(this.db.get(playlistId))
        .then(playlist => {
          this.currentPlaylist = playlist;
          return playlist;
        })
        .catch(utils.errorHandler(`Error get playlist by id ${playlistId}`));
    } else {
      return Promise.resolve(this.currentPlaylist);
    }
  }

  updateMultiplePlaylists(playlists) {
    this.db.bulkDocs(playlists)
      .then(resp => {})
      .catch(utils.errorHandler('Error update playlists'));
  }

  updateCourse(course) {
    return this.db.put(course)
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

  addOrUpdateNews(listNews) {
    this.db.bulkDocs(listNews).then(resp => {}).catch(
      utils.errorHandler('Error update news')
    );
  }

  getAllNews() {
    return Promise.resolve(this.db.allDocs({
        include_docs: true,
        startkey: 'news',
        endkey: 'news\uffff'
      }))
      .then(docs => {
        this.listNews = docs.rows.map(row => row.doc);
        this.listNews = this.listNews.sort((n1, n2) => {
          let d1 = new Date(n1.date);
          let d2 = new Date(n2.date);
          return d2.getTime() - d1.getTime();
        });
        return this.listNews;
      })
      .catch(utils.errorHandler('Error get all news'));
  }
}
