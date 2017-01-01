import { Injectable } from '@angular/core';
import { SQLite, Toast, File } from 'ionic-native';
import { Subject } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as utils from '../utils';
import { LocalStorageService } from './local-storage.service';

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

  playlistsByWordId: any[] = [];
  playlistsByWordIdSubject: Subject<any[]> = new Subject<any[]>();
  courses: any[] = [];
  coursesSubject: Subject<any[]> = new Subject<any[]>();
  latestNews: any;
  latestNewsSubject: Subject<any> = new Subject<any>();

  constructor(private translate: TranslateService, private storageService: LocalStorageService) {
    this.db = new SQLite();
    this.db.openDatabase({
      name: 'minagoi.db',
      location: 'default',
    }).then(this.initDatabase.bind(this)).then(this.getCourses.bind(this))
      .catch((err) => {
        Toast.showShortBottom(`Error init database ${JSON.stringify(err)}`).subscribe(() => {});
      });
  }

  private initDatabase() {
    return this.storageService.get('init_db').then((res) => {
      if (!res) return File.readAsText(`${cordova.file.applicationDirectory}www/assets`, 'minagoi.sql')
        .then(sqlText => {
          let listSQL = sqlText.toString().split('----').slice(0, -1);
          return this.db.sqlBatch(listSQL);
        });
    }).then(() => {
      this.storageService.set('init_db', true);
    });
  }

  getCourses() {
    let sql = 'SELECT * FROM `course`';
    return this.db.executeSql(sql, []).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      this.courses = data;
      this.coursesSubject.next(data);
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  deleteCourse(courseId) {
    let sql = 'UPDATE `course` SET `noWords` = 0, `noUnits` = 0, `downloaded` = 0 WHERE `id` = ?';
    return this.db.executeSql(sql, [ courseId ])
      .then(this.getCourses.bind(this))
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  addUnit(unit) {
    let sql = 'INSERT INTO `unit` (`id`, `name`, `number`, `locked`, `noWords`, `courseId`) VALUES (?,?,?,?,?,?)';
    return this.db.executeSql(sql, [ unit.id, unit.name, unit.number, unit.locked, unit.noWords, unit.courseId ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  addWords(words, unitId) {
    let sql = 'INSERT INTO `word` (`id`, `kanji`, `mainExample`, `meaning`, `otherExamples`, `phonetic`, `unitId`, `audioFile`, `audioDuration`) VALUES (?,?,?,?,?,?,?,?,?)';
    let listSql = words.map((word) => {
      return [
        sql, [ word.id, word.kanji, word.mainExample, word.meaning, word.otherExamples, word.phonetic, unitId, word.audioFile, word.audioDuration ]
      ];
    });
    return this.db.sqlBatch(listSql)
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateAudioFile(wordId, audioFile) {
    let sql = 'UPDATE `word` SET `audioFile` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ audioFile, wordId ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getPlaylistsByWordId(wordId: string) {
    let sql = 'SELECT `playlist`.*, `word_playlist`.`wordId` FROM `playlist` LEFT JOIN `word_playlist` ON `playlist`.`id` = `word_playlist`.`playlistId` AND `word_playlist`.`wordId` = ?';
    return this.db.executeSql(sql, [ wordId ]).then((resultSet) => {
        let data = this.convertResultSetToArray(resultSet);
        alert(`getAllPlaylistsByWordId ${JSON.stringify(data)}`);
        data.forEach((item) => {
          item.checked = !!item.wordId;
          delete item.wordId;
        });
        this.playlistsByWordId = data;
        this.playlistsByWordIdSubject.next(data);
        return data;
      }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getAllPlaylists() {
    let sql = 'SELECT * FROM `playlist`';
    return this.db.executeSql(sql, []).then((resultSet) => {
      return this.convertResultSetToArray(resultSet);
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  private convertResultSetToArray(resultSet) {
    let data = [];
    for (let iter = 0; iter < resultSet.rows.length; ++iter) {
      data.push(resultSet.rows.item(iter));
    }
    return data;
  }

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

  updateCourse(course) {
    let sql = 'UPDATE `course` SET `noWords` = ?, `noUnits` = ?, `downloaded` = ?';
    return this.db.executeSql(sql, [ course.noWords, course.noUnits, course.downloaded ])
      .catch(utils.errorHandler('Error_database'));
  }

  addPlaylist(playlist) {
    return this.db.executeSql('INSERT INTO `playlist` (`id`, `name`, `noWords`) VALUES (?,?,?)',
      [
        playlist.id,
        playlist.name,
        playlist.noWords
      ]).then(() => {
        this.playlistsByWordId.push(Object.assign({ checked: false }, playlist));
        this.playlistsByWordIdSubject.next(this.playlistsByWordId);
      })
    .catch(utils.errorHandler('Error_database'));
  }

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

  addOrUpdateNews(listNews) {
    let sql = 'INSERT OR REPLACE INTO `news` (`id`, `title`, `titleWithRuby`, `outlineWithRuby`, `contentWithRuby`, `imageUrl`, `voiceUrl`, `date`, `dateText`) VALUES (?,?,?,?,?,?,?,?,?)';
    let listSql = listNews.map((news) => {
      return [
        sql, [ news.id, news.title, news.titleWithRuby, news.outlineWithRuby, news.contentWithRuby, news.imageUrl, news.voiceUrl, news.date, news.dateText ]
      ];
    });
    return this.db.sqlBatch(listSql).then(this.getLatestNews.bind(this))
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getAllNews() {
    let sql = 'SELECT * FROM `news` ORDER BY `news`.`date` DESC';
    return this.db.executeSql(sql, []).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getLatestNews() {
    let sql = 'SELECT * FROM `news` ORDER BY `news`.`date` DESC LIMIT 1';
    return this.db.executeSql(sql, []).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      this.latestNews = data[0];
      this.latestNewsSubject.next(this.latestNews);
      return data[0];
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

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

  updateWord(word) {
    return this.db.executeSql('UPDATE `word` SET `lastPlayed` = ?, `timesPlayed` = ? WHERE `id` = ?',
      [
        word.id,
        word.lastPlayed,
        word.timesPlayed
      ]).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }
}
