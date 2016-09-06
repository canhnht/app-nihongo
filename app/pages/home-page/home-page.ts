import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Subscription} from 'rxjs';
import {Toast, Transfer, File, SpinnerDialog, MediaPlugin} from 'ionic-native';
import {NavController, Popover, Alert, NavParams, Modal} from 'ionic-angular';
import {PopoverMenu} from '../../components/popover-menu/popover-menu';
import {AudioSetting} from '../../components/audio-setting/audio-setting';
import {CustomCheckbox} from '../../components/custom-checkbox/custom-checkbox';
import {UnitsPage} from '../units-page/units-page';
import {WordSlides} from '../word-slides/word-slides';
import {NewsPage} from '../news-page/news-page';
import {NewsDetail} from '../news-detail/news-detail';
import {DbService} from '../../services/db.service';
import {SettingService, SettingStatus} from '../../services/setting.service';
import {CustomDatePipe} from '../../custom-date.pipe';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PlaylistOptions} from '../../components/playlist-options/playlist-options';
declare var require: any;
let firebase = require('firebase');

@Component({
  templateUrl: 'build/pages/home-page/home-page.html',
  directives: [AudioSetting, CustomCheckbox],
  pipes: [CustomDatePipe],
})
export class HomePage {
  courses: any[] = [];
  listCourseSubscription: Subscription;
  tabPage: string;
  listWord: any[] = [];
  searchedWords: any[] = [];
  selectedWords: any[] = [];
  settingSubscription: Subscription;
  listNewsSubscription: Subscription;
  latestNews: any = null;
  loadingNews: boolean = true;

  constructor(private navController: NavController, private dbService: DbService,
    private settingService: SettingService, private navParams: NavParams,
    private translate: TranslateService, private http: Http) {
    this.tabPage = this.navParams.data.tabPage || 'home';
    this.downloadNews();
  }

  ionViewWillEnter() {
    this.dbService.getListCourse().then(listCourse => {
      this.courses = listCourse;
      this.listWord = this.courses.reduce((arr, course) => {
        let wordsInUnits = course.units.reduce((words, unit) => {
          return words.concat(unit.words);
        }, []);
        return arr.concat(wordsInUnits);
      }, []);
      this.listWord = this.listWord.sort((w1, w2) => {
        if (w1.lastPlayed && w2.lastPlayed && w1.lastPlayed !== w2.lastPlayed)
          return w2.lastPlayed - w1.lastPlayed;
        return w2.timesPlayed - w1.timesPlayed;
      });
      this.searchedWords = [...this.listWord];
    });
    this.listCourseSubscription = this.dbService.listCourseSubject.subscribe(
      listCourse => {
        this.courses = listCourse;
        this.listWord = this.courses.reduce((arr, course) => {
          let wordsInUnits = course.units.reduce((words, unit) => {
            return words.concat(unit.words);
          }, []);
          return arr.concat(wordsInUnits);
        }, []);
        this.listWord = this.listWord.sort((w1, w2) => {
          if (w1.lastPlayed && w2.lastPlayed && w1.lastPlayed !== w2.lastPlayed)
            return w2.lastPlayed - w1.lastPlayed;
          return w2.timesPlayed - w1.timesPlayed;
        });
        this.searchedWords = [...this.listWord];
      }
    );

    this.settingService.reset(true);
    if (this.settingService.selectedType === 'search')
      this.selectedWords = this.settingService.selectedList;
    this.settingSubscription = this.settingService.settingSubject.subscribe(
      setting => {
        if (setting.selectedType === 'search')
          this.selectedWords = setting.selectedList;
      }
    );

    this.dbService.getAllNews().then(listNews => {
      this.latestNews = listNews[0];
    });
    this.listNewsSubscription = this.dbService.listNewsSubject.subscribe(
      listNews => this.latestNews = listNews[0]
    );
  }

  ionViewWillLeave() {
    this.listCourseSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
  }

  goToCourse(course) {
    this.navController.push(UnitsPage, {selectedCourseId: course._id});
  }

  deleteCourse(course) {
    let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/`;
    File.removeRecursively(folderPath, course._id).then(res => {
      Toast.showLongCenter(this.translate.instant('Delete_course_successfully', {
        courseName: course.courseName
      })).subscribe(() => {});
    }).catch(err => {
      Toast.showLongBottom('Error deleting').subscribe(() => {});
    });

    course.units = [];
    course.noWords = 0;
    course.downloaded = false;
    this.dbService.updateCourse(course);
  }

  downloadCourse(course, index) {
    course.downloading = true;
    let courseRef = firebase.database().ref(`${course._id}`);
    let courseData;
    courseRef.once('value').then(snapshot => {
      snapshot = snapshot.val();
      courseData = Object.assign({}, snapshot);
      courseData.units = [];
      Object.keys(snapshot.units).forEach(unitId => {
        let unit = Object.assign({ _id: unitId }, snapshot.units[unitId]);
        unit.words.forEach(word => {
          word.lastPlayed = null;
          word.timesPlayed = 0;
        });
        courseData.units.push(unit);
      });
      courseData.units = courseData.units.sort((u1, u2) => {
        return u1.number - u2.number;
      });
      courseData.units.forEach((unit, unitIndex) => {
        unit.unitIndex = unitIndex;
        unit.words.forEach((word, wordIndex) => {
          word.wordIndex = wordIndex;
          word.unitIndex = unitIndex;
        });
      });
      Object.assign(course, courseData);
      return this.dbService.updateCourse(course);
    }).then(() => {
      let storage = firebase.storage();
      let urlPromise = courseData.units.reduce((res, unit) => {
        let listPromise = unit.words.map(word => {
          let pathReference = storage.ref(`${course._id}/${unit._id}/${word.audioFile}.mp3`);
          return Promise.resolve(pathReference.getDownloadURL()).then(url => ({
            url,
            unitId: unit._id,
            audioFile: word.audioFile,
          }));
        });
        return res.concat(listPromise);
      }, []);
      return Promise.all(urlPromise);
    }).then(listUrl => {
      let downloadPromise = listUrl.map(item => {
        let folderPath = `file:///storage/emulated/0/Android/data/io.techybrain.mimi_kara_nihongo/files/${course._id}/${item.unitId}`;
        const fileTransfer = new Transfer();
        return Promise.resolve(fileTransfer.download(item.url,
          `${folderPath}/${item.audioFile}.mp3`));
      });
      return Promise.all(downloadPromise);
    }).then(res => {
      Toast.showLongCenter(this.translate.instant('Download_course_successfully', {
        courseName: course.courseName
      })).subscribe(() => {});
      course = this.courses[index];
      course.downloading = false;
      course.downloaded = true;
      course.units.forEach(unit => {
        unit.words.forEach(word => {
          word.audioFile = `${course._id}/${unit._id}/${word.audioFile}.mp3`;
        });
      });
      return this.dbService.updateCourse(course);
    })
    .catch(err => {
      course.downloading = false;
      Toast.showLongBottom('Error downloading').subscribe(() => {});
    });
  }

  search($event) {
    let value = $event.value;
    this.searchedWords = this.listWord.filter(word => {
      return word.kanji.startsWith(value) || word.hira_kata.startsWith(value);
    });
  }

  checkWord($event, word) {
    this.settingService.toggleWordInSearch(word);
    $event.stopPropagation();
  }

  selectWord($event, word) {
    if ($event.target.localName === 'label' || $event.target.localName === 'input') return;
    SpinnerDialog.show(this.translate.instant('Processing'),
      this.translate.instant('Please_wait'), false);
    this.navController.push(WordSlides, {
      playSingleWord: true,
      listWord: [word],
      wordIndex: 0
    });
  }

  addToPlaylist($event, word) {
    let modal = Modal.create(PlaylistOptions, { currentWord: word });
    this.navController.present(modal);
    $event.stopPropagation();
  }

  playNews() {
    let media = new MediaPlugin(this.latestNews.voiceUrl);
    media.play();
    setInterval(() => {
      let duration = media.getDuration();
      Toast.showShortBottom(`duration ${duration}`).subscribe(() => {});
      media.getCurrentPosition().then(position => {
        Toast.showShortBottom(`position ${position}`).subscribe(() => {});
      });
    }, 1000);
  }

  goToDetail() {
    this.navController.push(NewsDetail, { selectedNews: this.latestNews });
  }

  listAllNews() {
    this.navController.push(NewsPage);
  }

  downloadNews() {
    this.loadingNews = true;
    this.http.get('http://52.11.74.221/nihongo/nhk')
      .map(res => res.json())
      .subscribe(listNews => {
        this.loadingNews = false;
        this.dbService.addOrUpdateNews(listNews.map(news => {
          return Object.assign({}, news, {
            _id: `news${news.id}`
          });
        }));
      }, err => {
        this.loadingNews = false;
        Toast.showShortBottom(this.translate.instant('Download_news_error')).subscribe(() => {});
      });
  }
}
