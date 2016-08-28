import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DbService} from './db.service';
import {Toast} from 'ionic-native';

export enum SelectedType {
  Unit, WordInUnit,
  Playlist, WordInPlaylist,
  WordInSearch,
  None
}

export enum SettingStatus {
  Selecting, Playing, None
}

@Injectable()
export class SettingService {
  status: SettingStatus = SettingStatus.None;
  selectedType: SelectedType = SelectedType.None;
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
      this.selectedType = SelectedType.None;
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

  toggleUnit(unit) {
    if (this.selectedType !== SelectedType.Unit) this.reset(true);
    this.selectedType = SelectedType.Unit;
    let searchIndex = this.selectedList.indexOf(unit._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(unit._id, unit.words);
    this.pushState();
  }

  selectUnits(units) {
    this.selectedType = SelectedType.Unit;
    this.selectedList = units.map(unit => unit._id);
    this.selectedWords = units.map(unit => unit.words);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  togglePlaylist(playlist) {
    if (this.selectedType !== SelectedType.Playlist) this.reset(true);
    this.selectedType = SelectedType.Playlist;
    let searchIndex = this.selectedList.indexOf(playlist._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(playlist._id, playlist.words);
    this.pushState();
  }

  selectPlaylists(playlists) {
    this.selectedType = SelectedType.Playlist;
    this.selectedList = playlists.map(unit => unit._id);
    this.selectedWords = playlists.map(unit => unit.words);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInUnit(word) {
    if (this.selectedType !== SelectedType.WordInUnit) this.reset(true);
    this.selectedType = SelectedType.WordInUnit;
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }

  selectWordsInUnit(words) {
    this.selectedType = SelectedType.WordInUnit;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words.map(word => [word]);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInPlaylist(word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.WordInPlaylist) this.reset(true);
    this.selectedType = SelectedType.WordInPlaylist;
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }

  selectWordsInPlaylist(words) {
    this.selectedType = SelectedType.WordInPlaylist;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words.map(word => [word]);
    if (this.selectedList.length === 0) this.status = SettingStatus.None;
    else this.status = SettingStatus.Selecting;
    this.pushState();
  }

  toggleWordInSearch(word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.WordInSearch) this.reset(true);
    this.selectedType = SelectedType.WordInSearch;
    let searchIndex = this.selectedList.indexOf(word._id);
    if (searchIndex >= 0) this.removeItem(searchIndex);
    else this.addItem(word._id, [word]);
    this.pushState();
  }
}
