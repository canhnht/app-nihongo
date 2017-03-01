import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'commaConcat'
})
@Injectable()
export class CommaConcatPipe implements PipeTransform {

  transform(values): string {
    let result = values.join(', ');
    while (result[0] == '.' || result[0] == ',') result = result.substring(1);
    while (result[result.length - 1] == '.' || result[result.length - 1] == ',')
      result = result.substring(0, result.length - 1);
    return result;
  }
}
