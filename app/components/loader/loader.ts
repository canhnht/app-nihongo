import {Injectable, Component, Input, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {LoaderService} from '../../services/loader.service';
import {Toast} from 'ionic-native';

@Component({
  selector: 'loader',
  templateUrl: 'build/components/loader/loader.html',
})
export class Loader {
  isBusy: boolean = false;

  constructor(private loaderService: LoaderService) {
    this.loaderService.subject.subscribe(showIt => {
      Toast.showShortTop(`loader ${showIt}`).subscribe(() => {});
      this.isBusy = showIt;
    });
  }
}
