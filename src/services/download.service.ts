import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast, Transfer, File, Network } from 'ionic-native';
import { NavController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { DbService } from '../services';
import { TranslateService } from 'ng2-translate/ng2-translate';
let firebase = require('firebase');
declare var cordova: any;

@Injectable()
export class DownloadService {
  
  percDownloadedSubject: Subject<any> = new Subject<any>();

  constructor(private alertCtrl: AlertController, private dbService: DbService, private translate: TranslateService) {
  }

  downloadCourse(course, index) {
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
    let courseRef = firebase.database().ref(`${course.id}`);
    let snapshot;
    return courseRef.once('value').then(snapshotResponse => {
      snapshot = snapshotResponse.val();
      let downloadPromise = Object.keys(snapshot.units).map((unitId) => {
        let unit = {
          id: unitId,
          name: snapshot.units[unitId].unitName,
          number: snapshot.units[unitId].number,
          noWords: snapshot.units[unitId].noWords,
          locked: 1,
          courseId: course.id,
        };
        let words = snapshot.units[unitId].words;
        words.forEach((word) => {
          word.id = word._id;
          delete word._id;
          word.mainExample = JSON.stringify(word.mainExample);
          word.meaning = JSON.stringify(word.meaning);
          word.otherExamples = JSON.stringify(word.otherExamples);
          word.phonetic = JSON.stringify(word.phonetic);
        });

        let unitAndWordsPromise = this.dbService.addUnit(unit).then(() => {
          return this.dbService.addWords(words, unitId);
        });

        let audioPromise = this.downloadAudio(course.id, unitId, words);

        return Promise.all([unitAndWordsPromise, audioPromise]);

      });
      downloadPromise =  downloadPromise.concat(downloadPromise);
      let count = 0;
      let numOfUnits = downloadPromise.length;
      return downloadPromise.reduce((p, item) => {
        return p.then((res) => {
          count++;
          this.percDownloadedSubject.next({
            percDownloaded: (count / numOfUnits) * 100
          })
        })
      }, Promise.resolve())
    })
    .then(res => {
      Toast.showLongCenter(this.translate.instant('Download_course_successfully', {
        courseName: course.name
      })).subscribe(() => {});
      course.downloading = false;
      course.downloaded = true;
      course.noWords = snapshot.noWords;
      course.noUnits = Object.keys(snapshot.units).length;      
      this.dbService.updateCourse(course);
      return true;
    })
    .catch(err => {
      course.downloading = false;
      Toast.showLongBottom(this.translate.instant('Error_download_course')).subscribe(() => {});
    });
  }

  private downloadAudio(courseId, unitId, words) {
    let storage = firebase.storage();
    words = words.filter((word) => !!word.audioFile);
    let urlsPromise = words.map(word => {
      let pathReference = storage.ref(`${courseId}/${unitId}/${word.audioFile}.mp3`);
      return Promise.resolve(pathReference.getDownloadURL()).then(url => ({
        url,
        wordId: word.id,
        unitId: unitId,
        audioFile: word.audioFile,
      }));
    });
    return Promise.all(urlsPromise).then((listUrl) => {
      let downloadPromise = listUrl.map((item: any) => {
        let folderPath = `${cordova.file.dataDirectory}${courseId}/${unitId}`;
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(item.url,
          `${folderPath}/${item.audioFile}.mp3`)).then(() => {
            return this.dbService.updateAudioFile(item.wordId, `${courseId}/${unitId}/${item.audioFile}.mp3`);
          });
      });
      return Promise.all(downloadPromise);
    });
  }

}

