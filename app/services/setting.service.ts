import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DbService} from './db.service';
import {Toast} from 'ionic-native';

export enum SelectedType {
  Unit, WordInUnit,
  Playlist, WordInPlaylist,
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

  reset() {
    if (this.status === SettingStatus.Selecting) {
      this.status = SettingStatus.None;
      this.selectedList = [];
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
    });
  }

  addUnit(unit) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.Unit) this.selectedList = [];
    this.selectedType = SelectedType.Unit;
    this.selectedList.push(unit._id);
    this.selectedWords = [...this.selectedWords, ...unit.words];
    this.pushState();
  }

  selectUnits(units) {
    this.status = SettingStatus.Selecting;
    this.selectedType = SelectedType.Unit;
    this.selectedList = units.map(unit => unit._id);
    this.selectedWords = units.reduce((arr, unit) => arr.concat(unit.words), []);
    this.pushState();
  }

  addPlaylist(playlist) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.Playlist) this.selectedList = [];
    this.selectedType = SelectedType.Playlist;
    this.selectedList.push(playlist._id);
    this.selectedWords = [...this.selectedWords, ...playlist.words];
    this.pushState();
  }

  selectPlaylists(playlists) {
    this.status = SettingStatus.Selecting;
    this.selectedType = SelectedType.Playlist;
    this.selectedList = playlists.map(unit => unit._id);
    this.selectedWords = playlists.reduce((arr, unit) => arr.concat(unit.words), []);
    this.pushState();
  }

  addWordInUnit(word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.WordInUnit) this.selectedList = [];
    this.selectedType = SelectedType.WordInUnit;
    this.selectedList.push(word._id);
    this.selectedWords.push(word);
    this.pushState();
  }

  selectWordsInUnit(words) {
    this.status = SettingStatus.Selecting;
    this.selectedType = SelectedType.WordInUnit;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words;
    this.pushState();
  }

  addWordInPlaylist(word) {
    this.status = SettingStatus.Selecting;
    if (this.selectedType !== SelectedType.WordInPlaylist) this.selectedList = [];
    this.selectedType = SelectedType.WordInPlaylist;
    this.selectedList.push(word._id);
    this.selectedWords.push(word);
    this.pushState();
  }

  selectWordsInPlaylist(words) {
    this.status = SettingStatus.Selecting;
    this.selectedType = SelectedType.WordInPlaylist;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words;
    this.pushState();
  }
}
