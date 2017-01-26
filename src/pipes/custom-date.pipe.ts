import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

const MILLIS_IN_DAY: number = 24 * 60 * 60 * 1000;
const MILLIS_IN_WEEK: number = 7 * MILLIS_IN_DAY;

@Pipe({
  name: 'customDate'
})
@Injectable()
export class CustomDatePipe implements PipeTransform {

  transform(currentTime: number): string {
    if (!currentTime) return '--/--/----';
    let datePipe = new DatePipe('en-US');
    if (this.sameDay(currentTime))
      return datePipe.transform(currentTime, 'jm');  // 12:05 PM
    if (this.sameWeek(currentTime))
      return datePipe.transform(currentTime, 'E');  // Thu
    else return datePipe.transform(currentTime, 'yMMMd'); // Sep 3, 2010
  }

  sameDay(currentTime) {
    let now = Date.now();
    return Math.floor(now / MILLIS_IN_DAY) === Math.floor(currentTime / MILLIS_IN_DAY);
  }

  sameWeek(currentTime) {
    let now = Date.now();
    return Math.floor(now / MILLIS_IN_WEEK) === Math.floor(currentTime / MILLIS_IN_WEEK);
  }
}
