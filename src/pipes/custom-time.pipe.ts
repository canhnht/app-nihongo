import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

const MILLIS_IN_SECOND: number = 1000;
const MILLIS_IN_MINUTE: number = 60 * MILLIS_IN_SECOND;
const MILLIS_IN_HOUR: number = 60 * MILLIS_IN_MINUTE;

@Pipe({
  name: 'customTime'
})
@Injectable()
export class CustomTimePipe implements PipeTransform {

  constructor(private translate: TranslateService) {
  }

  transform(timeInMillis: number): string {
    let hours = Math.floor(timeInMillis / MILLIS_IN_HOUR) + '';
    while (hours.length < 2) hours = '0' + hours;
    timeInMillis %= MILLIS_IN_HOUR;
    let minutes = Math.floor(timeInMillis / MILLIS_IN_MINUTE) + '';
    while (minutes.length < 2) minutes = '0' + minutes;
    timeInMillis %= MILLIS_IN_MINUTE;
    let seconds = Math.floor(timeInMillis / MILLIS_IN_SECOND) + '';
    while (seconds.length < 2) seconds = '0' + seconds;
    let result = seconds + ' ' + this.translate.instant('second');
    if (minutes !== '00') result = minutes + ' ' + this.translate.instant('minute') + ' ' + result;
    if (hours !== '00') result = hours + ' ' + this.translate.instant('hour') + ' ' + result;
    return result;
  }
}
