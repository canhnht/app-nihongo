import { Injectable } from '@angular/core';
import { Firebase } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as utils from '../helpers/utils';

export const Events = {
  SEARCH_WORD: 'search_word',
  TUTORIAL_BEGIN: 'tutorial_begin',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  VIEW_COURSE: 'view_course',
  VIEW_UNIT: 'view_unit',
  VIEW_NEWS: 'view_news',
  VIEW_PROFILE: 'view_profile',
  DOWNLOAD_COURSE: 'download_course',
  DOWNLOAD_NEWS: 'download_news',
  USE_MODE: 'use_mode'
};

export const Params = {
  SEARCH_TERM: 'search_term',
  COURSE_ID: 'course_id',
  COURSE_NAME: 'course_name',
  COURSE_LEVEL: 'course_level',
  UNIT_ID: 'unit_id',
  UNIT_NUMBER: 'unit_number',
  MODE_TYPE: 'mode_type',
  NUMBER_WORDS: 'number_words'
};

@Injectable()
export class AnalyticsService {
  constructor(private translate: TranslateService) {
  }

  logEvent(eventName: string, params: any = {}) {
    Firebase.logEvent(eventName, params)
      .catch(utils.errorHandler(this.translate.instant('Error_analytics')));
  }

  setUserId(userId: string) {
    Firebase.setUserId(userId)
      .catch(utils.errorHandler(this.translate.instant('Error_analytics')));
  }
}
