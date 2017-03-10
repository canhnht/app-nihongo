import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast, Transfer, File } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import _ from 'lodash';
import { DbService } from '../services';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as utils from '../helpers/utils';

let firebase = require('firebase');
declare var cordova: any;

@Injectable()
export class DownloadService {
  percentPerWord: number;
  downloadedPercent: number = 0;
  percDownloadedSubject: Subject<any> = new Subject<any>();
  isConnected: boolean = true;

  constructor(private alertCtrl: AlertController, private dbService: DbService,
    private translate: TranslateService) {
  }

  private trackFirebaseConnection() {
    firebase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        this.isConnected = true;
      } else {
        this.isConnected = false;
      }
    });
  }

  private stopTrackFirebaseConnection() {
    firebase.database().ref('.info/connected').off('value');
  }

  downloadCourse(course) {
    this.trackFirebaseConnection();
    let remainingPercent = 100;
    return this.downloadCourseInfo(course.id).then((course) => {
      this.percDownloadedSubject.next({
        percDownloaded: 1
      });
      remainingPercent -= 1;

      let listUnitId = Object.keys(course.units).filter((unitId) => course.units[unitId]);

      return utils.downloadImageData(course.imageUrl).then((imageData) => {
        course.imageUrl = imageData;
        return this.dbService.updateCourse(course);
      }).then(() => this.downloadUnits(listUnitId));
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

        let listWordSegments = this.splitListWord(listWord);
        let segmentsPromise = listWordSegments.map((segment) => this.downloadWordSegmentPromise(segment));
        return segmentsPromise.reduce((p, e) => p.then(e), Promise.resolve());
      });
    }).then((res) => {
      this.stopTrackFirebaseConnection();
      course.downloaded = 1;
      return this.dbService.updateDownloadedCourse(course);
    })
    .catch((err) => {
      this.stopTrackFirebaseConnection();
      course.noUnits = 0;
      course.noWords = 0;
      return this.dbService.resetErrorCourse(course)
        .then(() => File.removeRecursively(cordova.file.dataDirectory, course.id))
        .then(() => {
          throw(err);
        });
    });
  }

  private splitListWord(words) {
    const chunkSize = 20;
    let idx = 0;
    return _.chain(words)
      .groupBy((e) => Math.floor((idx++) / chunkSize))
      .toArray().value();
  }

  private downloadCourseInfo(courseId) {
    let courseRef = firebase.database().ref(`/courses/${courseId}`);
    if (!this.isConnected) return Promise.reject(new Error('internet'));
    return courseRef.once('value').then((res) => res.val())
      .then((course) => Object.assign({ id: courseId }, course));
  }

  private downloadUnits(listUnitId) {
    let unitsPromise = listUnitId.map((unitId) => {
      let unitRef = firebase.database().ref(`/units/${unitId}`);
      return unitRef.once('value').then((res) => res.val()).then((unit) => {
        return utils.downloadImageData(unit.imageUrl).then((imageData) => {
          unit.imageUrl = imageData;
          return unit;
        });
      }).then((unit) => Object.assign({ id: unitId }, unit));
    });
    if (!this.isConnected) return Promise.reject(null);
    return Promise.all(unitsPromise);
  }

  private downloadWordSegmentPromise(listWord) {
    return () => {
      const wordsPromise = listWord.map((word) => this.downloadWord(word));
      return Promise.all(wordsPromise);
    };
  }

  private downloadWord({ id, unitId, courseId }) {
    let wordRef = firebase.database().ref(`/words/${id}`);
    if (!this.isConnected) return Promise.reject(null);
    let wordPromise = wordRef.once('value').then((res) => res.val());
    return wordPromise.then((word) => {
      if (!this.isConnected) return Promise.reject(null);
      return this.downloadAudio(courseId, unitId, word).then(() => {
        return this.dbService.addWord({
          id, unitId,
          kanji: word.kanji,
          audioFolder: `${courseId}/${unitId}/`,
          audioFile: `${word.audioFile}`,
          audioDuration: word.audioDuration,
          mainExample: JSON.stringify(word.mainExample),
          meaning: JSON.stringify(word.meaning),
          otherExamples: JSON.stringify(word.otherExamples),
          phonetic: JSON.stringify(word.phonetic),
        })
      });
    }).then(() => {
      this.downloadedPercent += this.percentPerWord;
      this.percDownloadedSubject.next({
        percDownloaded: this.downloadedPercent
      });
    });
  }

  private downloadAudio(courseId, unitId, word) {
    let storage = firebase.storage();
    let pathReference = storage.ref(`${courseId}/${unitId}/${word.audioFile}`);
    return pathReference.getDownloadURL().then((url) => {
      let folderPath = `${cordova.file.dataDirectory}${courseId}/${unitId}`;
      const fileTransfer = new Transfer();
      return fileTransfer.download(url,
        `${folderPath}/${word.audioFile}`);
    });
  }
}

