import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, Toast, File } from 'ionic-native';
import { Subject } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as utils from '../helpers/utils';
import { LocalStorageService } from './local-storage.service';

declare var cordova: any;

@Injectable()
export class DbService {
  db: any = null;
  initSubject: Subject<any> = new Subject<any>();
  playlistsByWordId: any[] = [];
  playlistsByWordIdSubject: Subject<any[]> = new Subject<any[]>();
  courses: any[] = [];
  coursesSubject: Subject<any[]> = new Subject<any[]>();
  latestNews: any;
  latestNewsSubject: Subject<any> = new Subject<any>();
  playlists: any[] = [];
  playlistsSubject: Subject<any[]> = new Subject<any[]>();

  constructor(private translate: TranslateService, private storageService: LocalStorageService,
    private platform: Platform) {
    this.platform.ready().then(() => {
      this.db = new SQLite();
      this.db.openDatabase({
        name: 'minagoi.db',
        location: 'default',
      }).then(() => this.storageService.get('init_db')).then((res) => {
          if (!res) return File.readAsText(`${cordova.file.applicationDirectory}www/assets`, 'minagoi.sql');
          else {
            this.initSubject.next(true);
            return Promise.reject(null);
          }
        }).then((sqlText) => {
          let listSQL = sqlText.toString().split('----').slice(0, -1);
          return this.db.sqlBatch(listSQL);
        })
        .then(() => {
          this.initSubject.next(true);
          return this.storageService.set('init_db', true);
        })
        .catch((err) => {
          if (err)
            Toast.showShortBottom(`Error init database ${JSON.stringify(err)}`).subscribe(() => {});
        });
    })
  }

  getCourses() {
    let sql = 'SELECT * FROM `course` ORDER BY `id`';
    return this.db.executeSql(sql, []).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      this.courses = data;
      this.coursesSubject.next(data);
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getCoursesById(listCourseId) {
    let courseIdCondition = listCourseId.join(',');
    let sql = 'SELECT * FROM `course` WHERE `id` IN (?) ORDER BY `id`';
    return this.db.executeSql(sql, [ courseIdCondition ]).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateDownloadedCourse(course) {
    let sql = 'UPDATE `course` SET `downloaded` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ course.downloaded, course.id ])
      .catch(utils.errorHandler('Error_database'));
  }

  updateCourse(course) {
    let sql = 'UPDATE `course` SET `imageUrl` = ?, `name` = ?, `free` = ?, `level` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ course.imageUrl, course.name, course.free, course.level, course.id ])
      .catch(utils.errorHandler('Error_database'));
  }

  addOrUpdateCourses(listCourse) {
    let sql = 'INSERT OR REPLACE INTO `course` (`id`, `name`, `level`, `imageUrl`, `free`, `downloaded`, `noWords`, `noUnits`) VALUES (?,?,?,?,?, (SELECT `downloaded` FROM `course` WHERE `id` = ?), (SELECT `noWords` FROM `course` WHERE `id` = ?), (SELECT `noUnits` FROM `course` WHERE `id` = ?))';
    let listSql = listCourse.map((course) => {
      return [
        sql, [ course.id, course.name, course.level, course.imageUrl, course.free, course.id, course.id, course.id ]
      ];
    });
    return this.db.sqlBatch(listSql).then(this.getCourses.bind(this))
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  addUnits(units) {
    let sql = 'INSERT INTO `unit` (`id`, `name`, `number`, `courseId`, `imageUrl`) VALUES (?,?,?,?,?)';
    let listSql = units.map((unit) => {
      return [
        sql, [ unit.id, unit.name, unit.number, unit.courseId, unit.imageUrl ]
      ];
    });
    return this.db.sqlBatch(listSql)
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  addWord(word) {
    let sql = 'INSERT INTO `word` (`id`, `kanji`, `mainExample`, `meaning`, `otherExamples`, `phonetic`, `unitId`, `audioFile`, `audioDuration`) VALUES (?,?,?,?,?,?,?,?,?)';
    return this.db.executeSql(sql, [ word.id, word.kanji, word.mainExample, word.meaning, word.otherExamples, word.phonetic, word.unitId, word.audioFile, word.audioDuration ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateAudioFile(wordId, audioFile) {
    let sql = 'UPDATE `word` SET `audioFile` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ audioFile, wordId ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getPlaylistsByWordId(wordId) {
    let sql = 'SELECT `playlist`.*, `word_playlist`.`wordId` FROM `playlist` LEFT JOIN `word_playlist` ON `playlist`.`id` = `word_playlist`.`playlistId` AND `word_playlist`.`wordId` = ?';
    return this.db.executeSql(sql, [ wordId ]).then((resultSet) => {
        let data = this.convertResultSetToArray(resultSet);
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
      let data = this.convertResultSetToArray(resultSet);
      this.playlists = data;
      this.playlistsSubject.next(data);
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  addPlaylist(playlist) {
    let sql = 'INSERT INTO `playlist` (`id`, `name`, `noWords`) VALUES (?,?,?)';
    return this.db.executeSql(sql, [ playlist.id, playlist.name, playlist.noWords ]).then(() => {
      this.playlistsByWordId.push(Object.assign({ checked: false }, playlist));
      this.playlistsByWordIdSubject.next(this.playlistsByWordId);
    })
    .catch(utils.errorHandler('Error_database'));
  }

  deletePlaylist(playlist) {
    let sql = 'DELETE FROM `playlist` WHERE `id` = ?';
    return this.db.executeSql(sql, [ playlist.id ]).then(this.getAllPlaylists.bind(this))
      .catch(utils.errorHandler('Error_database'));
  }

  updatePlaylist(playlist) {
    let sql = 'UPDATE `playlist` SET `name` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ playlist.name, playlist.id ])
      .catch(utils.errorHandler('Error_database'));
  }

  private convertResultSetToArray(resultSet) {
    let data = [];
    for (let iter = 0; iter < resultSet.rows.length; ++iter) {
      data.push(resultSet.rows.item(iter));
    }
    return data;
  }

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

  updateWord(word) {
    let sql = 'UPDATE `word` SET `lastPlayed` = ?, `timesPlayed` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ word.id, word.lastPlayed, word.timesPlayed ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getWordsByUnitId(unitId) {
    let sql = 'SELECT `word`.*, `playlistId` FROM `word` LEFT JOIN `word_playlist` ON `word`.`id` = `word_playlist`.`wordId` WHERE `unitId` = ? GROUP BY `word`.`id` ORDER BY `lastPlayed` DESC, `timesPlayed` DESC, `word`.`id` ASC';
    return this.db.executeSql(sql, [ unitId ]).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      data.forEach((word) => {
        word.bookmarked = !!word.playlistId;
        delete word.playlistId;
        this.processWord(word);
      });
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getWordsByPlaylistId(playlistId) {
    let sql = 'SELECT `word`.* FROM `word` JOIN `word_playlist` ON `word`.`id` = `word_playlist`.`wordId` AND `word_playlist`.`playlistId` = ? ORDER BY `lastPlayed` DESC, `timesPlayed` DESC';
    return this.db.executeSql(sql, [ playlistId ]).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      data.forEach((word) => {
        this.processWord(word);
      });
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  getRandomWords(numberWords) {
    let sql = 'SELECT * FROM `word` ORDER BY RANDOM() LIMIT ?';
    return this.db.executeSql(sql, [ numberWords ]).then((resultSet) => {
      let data = this.convertResultSetToArray(resultSet);
      data.forEach((word) => {
        this.processWord(word);
      });
      return data;
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  private processWord(word) {
    word.mainExample = JSON.parse(word.mainExample);
    word.meaning = JSON.parse(word.meaning);
    word.otherExamples = JSON.parse(word.otherExamples);
    word.phonetic = JSON.parse(word.phonetic);
    if (!word.meaning) word.meaning = [];
    if (!word.otherExamples) word.otherExamples = [];
    if (!word.phonetic) word.phonetic = [];
    if (!word.mainExample) word.mainExample = {};
    word.otherExamples = word.otherExamples.slice(0, 5);
  }

  getUnitsByCourseId(courseId) {
    let sql = 'SELECT * FROM `unit` WHERE `courseId` = ?';
    return this.db.executeSql(sql, [ courseId ]).then((resultSet) => {
      return this.convertResultSetToArray(resultSet);
    }).catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateWordPlaylist(wordId, diffPlaylists) {
    let insertSql = 'INSERT INTO `word_playlist` (`wordId`, `playlistId`) VALUES (?,?)';
    let deleteSql = 'DELETE FROM `word_playlist` WHERE `wordId` = ? AND `playlistId` = ?';
    let listSql = diffPlaylists.map((playlist) => {
      if (!playlist.checked && playlist.selected) return [
        insertSql, [ wordId, playlist.id ]
      ]; else if (playlist.checked && !playlist.selected) return [
        deleteSql, [ wordId, playlist.id ]
      ];
    });
    return this.db.sqlBatch(listSql)
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  deleteWordPlaylist(wordId, playlistId) {
    let sql = 'DELETE FROM `word_playlist` WHERE `wordId` = ? AND `playlistId` = ?';
    return this.db.executeSql(sql, [ wordId, playlistId ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateAnalytic(word) {
    let sql = 'UPDATE `word` SET `lastPlayed` = ?, `timesPlayed` = `timesPlayed` + 1 WHERE `id` = ?';
    return this.db.executeSql(sql, [ Date.now(), word.id ])
      .catch(utils.errorHandler(this.translate.instant('Error_database')));
  }

  updateStateOfUnit(unit){
    let sql = 'UPDATE `unit` SET `state` = ? WHERE `id` = ?';
    return this.db.executeSql(sql, [ unit.state, unit.id ])
      .catch(utils.errorHandler('Error_database'));
  }

}
