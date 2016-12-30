import { Injectable } from '@angular/core';
import { SQLite, Toast, File } from 'ionic-native';
// import * as utils from '../utils';
import { Subject } from 'rxjs';

declare var cordova: any;

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
    this.db = new SQLite();
    this.db.openDatabase({
      name: 'minagoi.db',
      location: 'default',
    }).then(this.initDatabase.bind(this)).catch((err) => {
      Toast.showShortBottom(`Error init database ${JSON.stringify(err)}`).subscribe(() => {});
    });
  }

  private initDatabase() {
    return File.readAsText(`${cordova.file.applicationDirectory}www/assets`, 'minagoi.sql')
      .then(sqlText => {
        let listSQL = sqlText.toString().split(';');
        return this.db.sqlBatch(listSQL).then(() => {
          return this.db.executeSql('INSERT INTO `word` (`id`, `kanji`, `mainExample`, `meaning`, `otherExamples`, `phonetic`, `unitId`) VALUES (?,?,?,?,?,?,?)',
            [
              'word1',
              '渇く',
              '{"content":"のどが渇いた。","meaning":"Khát nước."}',
              '[{"kind":"v5k, vi","mean":"khát; khát khô cổ"},{"kind":"v5k, vi","mean":"khô; bị khô"}]',
              '[{"content":"手（のひら）が汗でじっとりとしのどが渇くのを感じる","meaning":"Cảm thấy lòng bàn tày ướt đẫm mồ hôi và khát khô cả cổ","phonetic":"て（のひら）があせでじっとりとしのどがかわくのをかんじる"}]',
              '["かわく"]',
              'unit1'
            ]);
        });
      });
  }

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
