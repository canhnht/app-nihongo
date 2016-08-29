import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DbService} from './db.service';
import {Toast} from 'ionic-native';

export enum SettingStatus {
  Selecting, Playing, None
}

@Injectable()
export class SettingService {
  status: SettingStatus = SettingStatus.None;
  selectedType: string = null;
  selectedList: any[] = [];
  settingSubject: Subject<any> = new Subject<any>();
  selectedWords: any[] = [];

  constructor(private dbService: DbService) {
  }

  reset(force: boolean = false) {
    if (this.status === SettingStatus.Selecting || force) {
      this.status = SettingStatus.None;
      this.selectedList = [];
      this.selectedWords = [];
      this.selectedType = null;
    }
  }

  playAudio() {
    this.status = SettingStatus.Playing;
    this.pushState();
  }

  private pushState() {
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
      status: this.status,
      countWords: this.selectedWords.reduce((sum, item) => sum + item.length, 0),
    });
  }

  private removeItem(index) {
    this.selectedList.splice(index, 1);
    this.selectedWords.splice(index, 1);
    if (this.selectedList.length > 0) this.status = SettingStatus.Selecting;
    else this.status = SettingStatus.None;
  }

  private addItem(item, listWord) {
    this.selectedList.push(item);
    this.selectedWords.push(listWord);
    this.status = SettingStatus.Selecting;
  }

  toggleWordInUnit(unitId, word) {
    if (this.selectedType !== unitId) this.reset(true);
    this.selectedType = unitId;
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }

  selectWordsInUnit(unitId, words) {
    this.selectedType = unitId;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words.map(word => [word]);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInPlaylist(playlistId, word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== playlistId) this.reset(true);
    this.selectedType = playlistId;
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }

  selectWordsInPlaylist(playlistId, words) {
    this.selectedType = playlistId;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words.map(word => [word]);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInSearch(word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== 'search') this.reset(true);
    this.selectedType = 'search';
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }
}
