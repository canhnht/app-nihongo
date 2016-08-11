import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DbService} from './db.service';
import {Toast} from 'ionic-native';

export enum SelectedType {
  Unit, WordInUnit,
  Playlist, WordInPlaylist,
  None
}

@Injectable()
export class SettingService {
  selectedType: SelectedType = SelectedType.None;
  selectedList: any[] = [];
  settingSubject: Subject<any> = new Subject<any>();
  selectedWords: any[] = [];

  constructor(private dbService: DbService) {
  }

  addUnit(unit) {
    if (this.selectedType !== SelectedType.Unit) this.selectedList = [];
    this.selectedType = SelectedType.Unit;
    this.selectedList.push(unit._id);
    this.selectedWords = [...this.selectedWords, ...unit.words];
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  selectUnits(units) {
    this.selectedType = SelectedType.Unit;
    this.selectedList = units.map(unit => unit._id);
    this.selectedWords = units.reduce((arr, unit) => arr.concat(unit.words), []);
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  addPlaylist(playlist) {
    if (this.selectedType !== SelectedType.Playlist) this.selectedList = [];
    this.selectedType = SelectedType.Playlist;
    this.selectedList.push(playlist._id);
    this.selectedWords = [...this.selectedWords, ...playlist.words];
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  selectPlaylists(playlists) {
    this.selectedType = SelectedType.Playlist;
    this.selectedList = playlists.map(unit => unit._id);
    this.selectedWords = playlists.reduce((arr, unit) => arr.concat(unit.words), []);
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  addWordInUnit(word) {
    if (this.selectedType !== SelectedType.WordInUnit) this.selectedList = [];
    this.selectedType = SelectedType.WordInUnit;
    this.selectedList.push(word._id);
    this.selectedWords.push(word);
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  selectWordsInUnit(words) {
    this.selectedType = SelectedType.WordInUnit;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words;
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  addWordInPlaylist(word) {
    if (this.selectedType !== SelectedType.WordInPlaylist) this.selectedList = [];
    this.selectedType = SelectedType.WordInPlaylist;
    this.selectedList.push(word._id);
    this.selectedWords.push(word);
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }

  selectWordsInPlaylist(words) {
    this.selectedType = SelectedType.WordInPlaylist;
    this.selectedList = words.map(word => word._id);
    this.selectedWords = words;
    this.settingSubject.next({
      selectedType: this.selectedType,
      selectedList: this.selectedList,
    });
  }
}
