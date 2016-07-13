import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class LoaderService {
  subject: Subject<boolean> = new Subject<boolean>();

  showLoader() {
    this.subject.next(true);
  }

  hideLoader() {
    this.subject.next(false);
  }
}
