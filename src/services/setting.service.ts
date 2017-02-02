import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SettingStatus } from '../helpers/custom-types';

@Injectable()
export class SettingService {
  status: SettingStatus = SettingStatus.None;
  selectedType: string = null;
  selectedList: any[] = [];
  settingSubject: Subject<any> = new Subject<any>();
  selectedWords: any[] = [];

  constructor() {
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

  stopAudio() {
    this.status = SettingStatus.Selecting;
    this.pushState();
  }

  deleteSelectedWord(wordId) {
    let searchIndex = this.selectedList.indexOf(wordId);
    this.removeWord(searchIndex);
    this.pushState();
  }

  private pushState() {
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
      status: this.status,
      countWords: this.selectedWords.length,
    });
  }

  private removeWord(index) {
    this.selectedList.splice(index, 1);
    this.selectedWords.splice(index, 1);
    if (this.selectedList.length > 0) this.status = SettingStatus.Selecting;
    else this.status = SettingStatus.None;
  }

  private addWord(word) {
    this.selectedList.push(word.id);
    this.selectedWords.push(word);
    this.status = SettingStatus.Selecting;
  }

  toggleWordInUnit(unitId, word) {
    if (this.selectedType !== unitId) this.reset(true);
    this.selectedType = unitId;
    let searchIndex = this.selectedList.indexOf(word.id);
    if (searchIndex >= 0) this.removeWord(searchIndex);
    else this.addWord(word);
    this.pushState();
  }

  selectWordsInUnit(unitId, words) {
    this.selectedType = unitId;
    this.selectedList = words.map(word => word.id);
    this.selectedWords = [...words];
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInPlaylist(playlistId, word) {
    if (this.selectedType !== playlistId) this.reset(true);
    this.selectedType = playlistId;
    let searchIndex = this.selectedList.indexOf(word.id);
    if (searchIndex >= 0) this.removeWord(searchIndex);
    else this.addWord(word);
    this.pushState();
  }

  selectWordsInPlaylist(playlistId, words) {
    this.selectedType = playlistId;
    this.selectedList = words.map(word => word.id);
    this.selectedWords = [...words];
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }
}
