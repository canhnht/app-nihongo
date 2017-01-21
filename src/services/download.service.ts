import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast, Transfer, Network } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import { DbService } from '../services';
import { TranslateService } from 'ng2-translate/ng2-translate';
let firebase = require('firebase');
declare var cordova: any;

@Injectable()
export class DownloadService {
  percentPerWord: number;
  downloadedPercent: number;
  percDownloadedSubject: Subject<any> = new Subject<any>();

  constructor(private alertCtrl: AlertController, private dbService: DbService, private translate: TranslateService) {
  }

  downloadCourse(course) {
    if (Network.connection === 'none' || Network.connection === 'unknown') {
      let alert = this.alertCtrl.create({
        title: 'Kết nối internet',
        subTitle: 'Hãy bật kết nối internet để bắt đầu tải khóa học!',
        buttons: ['Đồng ý']
      });
      alert.present();
      return;
    }
    course.downloading = true;
    let remainingPercent = 100;
    return this.downloadCourseInfo(course.id).then((course) => {
      this.percDownloadedSubject.next({
        percDownloaded: 1
      });
      remainingPercent -= 1;

      let listUnitId = Object.keys(course.units).filter((unitId) => course.units[unitId]);

      // let promiseUpdateCourse = this.dbService.updateCourse(course);
      // let promiseDownloadUnits = this.downloadUnits(listUnitId);
      // return Promise.all([ promiseUpdateCourse, promiseDownloadUnits ]);
      return this.dbService.updateCourse(course).then(() => this.downloadUnits(listUnitId));
    }).then((listUnit) => {
      this.percDownloadedSubject.next({
        percDownloaded: 2
      });
      remainingPercent -= 1;

      let listWord = listUnit.reduce((result, unit) => {
        return result.concat(Object.keys(unit.words)
          .filter((wordId) => unit.words[wordId])
          .map((wordId) => ({
            id: wordId,
            unitId: unit.id,
            courseId: course.id,
          })));
      }, []);
      listUnit = listUnit.map((unit) => ({
        id: unit.id,
        name: unit.name,
        number: unit.number,
        courseId: course.id,
        imageUrl: unit.imageUrl
      }));
      return this.dbService.addUnits(listUnit).then(() => {
        this.percDownloadedSubject.next({
          percDownloaded: 3
        });
        remainingPercent -= 1;

        this.percentPerWord = remainingPercent / listWord.length;
        this.downloadedPercent = 3;
        let wordsPromise = listWord.map((word) => this.downloadWord(word));
        return Promise.all(wordsPromise);
      });
    }).then(res => {
      Toast.showLongCenter(this.translate.instant('Download_course_successfully', {
        courseName: course.name
      })).subscribe(() => {});
      course.downloading = false;
      course.downloaded = true;
      return this.dbService.updateDownloadedCourse(course);
    })
    .catch(err => {
      course.downloading = false;
      Toast.showLongBottom(this.translate.instant('Error_download_course')).subscribe(() => {});
    });
  }

  private downloadCourseInfo(courseId) {
    let courseRef = firebase.database().ref(`/courses/${courseId}`);
    return courseRef.once('value').then((res) => res.val())
      .then((course) => Object.assign({ id: courseId }, course));
  }

  private downloadUnits(listUnitId) {
    let unitsPromise = listUnitId.map((unitId) => {
      let unitRef = firebase.database().ref(`/units/${unitId}`);
      return unitRef.once('value').then((res) => res.val())
        .then((unit) => Object.assign({ id: unitId }, unit));
    });
    return Promise.all(unitsPromise);
  }

  private downloadWord({ id, unitId, courseId }) {
    let wordRef = firebase.database().ref(`/words/${id}`);
    let wordPromise = wordRef.once('value').then((res) => res.val());
    return wordPromise.then((word) => {
      return this.downloadAudio(courseId, unitId, word).then(() => {
        return this.dbService.addWord({
          id, unitId,
          kanji: word.kanji,
          audioFile: (word.audioFile ? `${courseId}/${unitId}/${word.audioFile}.mp3` : ''),
          audioDuration: word.audioDuration,
          mainExample: JSON.stringify(word.mainExample),
          meaning: JSON.stringify(word.meaning),
          otherExamples: JSON.stringify(word.otherExamples),
          phonetic: JSON.stringify(word.phonetic),
        })
      }).then(() => {
        this.downloadedPercent += this.percentPerWord;
        this.percDownloadedSubject.next({
          percDownloaded: this.downloadedPercent
        });
      });
    });
  }

  private downloadAudio(courseId, unitId, word) {
    let storage = firebase.storage();
    if (!word.audioFile) return Promise.resolve();
    else {
      let pathReference = storage.ref(`${courseId}/${unitId}/${word.audioFile}.mp3`);
      return Promise.resolve(pathReference.getDownloadURL()).then((url) => {
        let folderPath = `${cordova.file.dataDirectory}${courseId}/${unitId}`;
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(url,
          `${folderPath}/${word.audioFile}.mp3`));
      });
      // .then(() => this.dbService.updateAudioFile(word.id, `${courseId}/${unitId}/${word.audioFile}.mp3`));
    }
  }
}

