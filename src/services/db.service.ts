import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';
// import * as utils from '../utils';
import { Subject } from 'rxjs';

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
  gameMultipleChoiceSubject: Subject<any> = new Subject<any>();
  gameExploreJapanSubject: Subject<any> = new Subject<any>();

  constructor() {
    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      alert('open database');
      db.executeSql(`create table danceMoves(name VARCHAR(32));`, {}).then(() => {
        alert('executeSql');
      }, (err) => {
        alert(`sql ${JSON.stringify(err)}`);
        db.executeSql(`insert into danceMoves values ('dance 1'); insert into danceMoves values ('dance 2');`, {}).then(() => {
          alert('insert');
        }).catch((err) => {
          alert(`error insert ${JSON.stringify(err)}`);
        });
      });
    }).catch((err) => {
      alert(JSON.stringify(err));
    });
  }

  // private initDatabase(courseData) {
  //   return this.db.load(courseData).then(() => {
  //     this.listenForChange();
  //     this.getListCourse().then(listCourse => {
  //       this.listCourseSubject.next(listCourse);
  //     });
  //     let localLoadedPromise = this.db.put({_id: '_local/preloaded'});
  //     // let gameMultipleChoicePromise = this.db.put({
  //     //   _id: 'gameMultipleChoice',
  //     //   currentLevel: 1,
  //     //   numberPlay: 0,
  //     //   achievements: []
  //     // });
  //     // let gameExploreJapanPromise = this.db.put({
  //     //   _id: 'gameExploreJapan',
  //     //   sushi: new Array(9).fill(0),
  //     //   sadou: new Array(9).fill(0),
  //     //   ikebana: new Array(9).fill(0),
  //     //   stars: 0
  //     // });
  //     // return Promise.all([localLoadedPromise, gameMultipleChoicePromise, gameExploreJapanPromise]);
  //     return localLoadedPromise;
  //   });
  // }

  // private listenForChange() {
  //   const onDatabaseChange = (change) => {
  //     if (change.deleted) return;
  //     let doc = change.doc;
  //     if (doc._id.startsWith('course')) {
  //       this.currentCourse = doc;
  //       this.currentCourseSubject.next(doc);
  //       this.allCourses[doc._id] = doc;
  //       this.allCoursesSubject.next(this.allCourses);
  //       let courseIndex = this.listCourse.findIndex(course => course._id === doc._id);
  //       this.listCourse[courseIndex] = doc;
  //       this.listCourseSubject.next(this.listCourse);
  //     } else if (doc._id.startsWith('playlist')) {
  //       this.playlistSubject.next(doc);
  //       if (doc._id === this.currentPlaylist._id)
  //         this.currentPlaylistSubject.next(doc);
  //     } else if (doc._id.startsWith('news')) {
  //       this.listNews.push(doc);
  //       this.listNews = this.listNews.sort((n1, n2) => {
  //         let d1 = new Date(n1.date);
  //         let d2 = new Date(n2.date);
  //         return d2.getTime() - d1.getTime();
  //       });
  //       this.listNewsSubject.next(this.listNews);
  //     } else if (doc._id == 'gameMultipleChoice') {
  //       this.gameMultipleChoiceSubject.next(doc);
  //     } else if (doc._id == 'gameExploreJapan') {
  //       this.gameExploreJapanSubject.next(doc);
  //     }
  //   };
  //   this.db.changes({ live: true, since: 'now', include_docs: true })
  //     .on('change', onDatabaseChange);
  // }

  // getListCourse() {
  //   return Promise.resolve(this.db.allDocs({
  //     include_docs: true,
  //     startkey: 'course',
  //     endkey: 'course\uffff'
  //   })).then(docs => {
  //     this.listCourse = docs.rows.map(row => {
  //       let course = row.doc;
  //       return course;
  //     });
  //     return this.listCourse;
  //   }).catch(utils.errorHandler('Error get list course'));
  // }

  // getAllCourses() {
  //   return Promise.resolve(this.db.allDocs({
  //     include_docs: true,
  //     startkey: 'course',
  //     endkey: 'course\uffff'
  //   })).then(docs => {
  //     this.allCourses = docs.rows.reduce((res, row) => {
  //       res[row.doc._id] = row.doc;
  //       return res;
  //     }, {});
  //     return this.allCourses;
  //   }).catch(utils.errorHandler('Error get all courses'));
  // }

  // getCourse(courseId) {
  //   if (!this.currentCourse || this.currentCourse._id !== courseId) {
  //     return Promise.resolve(this.db.get(courseId))
  //       .then(course => {
  //         this.currentCourse = course;
  //         return course;
  //       })
  //       .catch(utils.errorHandler(`Error get course by id ${courseId}`));
  //   } else {
  //     return Promise.resolve(this.currentCourse);
  //   }
  // }

  // getAllPlaylists() {
  //   return Promise.resolve(this.db.allDocs({
  //       include_docs: true,
  //       startkey: 'playlist',
  //       endkey: 'playlist\uffff'
  //     }))
  //     .then(docs => {
  //       return docs.rows.map(row => row.doc);
  //     })
  //     .catch(utils.errorHandler('Error get all playlists'));
  // }

  // getPlaylist(playlistId) {
  //   if (!this.currentPlaylist || this.currentPlaylist._id !== playlistId) {
  //     return Promise.resolve(this.db.get(playlistId))
  //       .then(playlist => {
  //         this.currentPlaylist = playlist;
  //         return playlist;
  //       })
  //       .catch(utils.errorHandler(`Error get playlist by id ${playlistId}`));
  //   } else {
  //     return Promise.resolve(this.currentPlaylist);
  //   }
  // }

  // updateMultiplePlaylists(playlists) {
  //   this.db.bulkDocs(playlists)
  //     .then(resp => {})
  //     .catch(utils.errorHandler('Error update playlists'));
  // }

  // updateCourse(course) {
  //   return this.db.put(course)
  //     .then(resp => {})
  //     .catch(utils.errorHandler('Error update course'));
  // }

  // addPlaylist(playlist) {
  //   this.db.put(playlist)
  //     .then(resp => {})
  //     .catch(utils.errorHandler('Error add playlist'));
  // }

  // deletePlaylist(playlist) {
  //   this.db.remove(playlist)
  //     .then(resp => {})
  //     .catch(utils.errorHandler('Error delete playlist'));
  // }

  // updatePlaylist(playlist) {
  //   this.db.put(playlist).then(resp => {}).catch(
  //     utils.errorHandler('Error update playlist')
  //   );
  // }

  // addOrUpdateNews(listNews) {
  //   this.db.bulkDocs(listNews).then(resp => {}).catch(
  //     utils.errorHandler('Error update news')
  //   );
  // }

  // getAllNews() {
  //   return Promise.resolve(this.db.allDocs({
  //       include_docs: true,
  //       startkey: 'news',
  //       endkey: 'news\uffff'
  //     }))
  //     .then(docs => {
  //       this.listNews = docs.rows.map(row => row.doc);
  //       this.listNews = this.listNews.sort((n1, n2) => {
  //         let d1 = new Date(n1.date);
  //         let d2 = new Date(n2.date);
  //         return d2.getTime() - d1.getTime();
  //       });
  //       return this.listNews;
  //     })
  //     .catch(utils.errorHandler('Error get all news'));
  // }

  // getWordsOfAllCourses() {
  //   let listWord = this.listCourse.reduce((arr, course) => {
  //     let wordsInUnits = course.units.reduce((words, unit) => {
  //       return words.concat(unit.words);
  //     }, []);
  //     return arr.concat(wordsInUnits);
  //   }, []);
  //   return listWord;
  // }

  // getGameMultipleChoice() {
  //   return this.db.get('gameMultipleChoice').catch(
  //     utils.errorHandler('Error get game info')
  //   );
  // }

  // updateGameMultipleChoice(game) {
  //   this.db.put(game).then(resp => {}).catch(
  //     utils.errorHandler('Error update game')
  //   );
  // }

  // getGameExploreJapan() {
  //   return this.db.get('gameExploreJapan').catch(
  //     utils.errorHandler('Error get game info')
  //   );
  // }

  // updateGameExploreJapan(game) {
  //   this.db.put(game).then(resp => {}).catch(
  //     utils.errorHandler('Error update game')
  //   );
  // }

  // getExploreJapanData() {
  //   return this.db.get('exploreJapanData').catch(
  //     utils.errorHandler('Error get game data')
  //   );
  // }
}
