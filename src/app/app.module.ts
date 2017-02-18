import { NgModule, ErrorHandler } from '@angular/core';
import { Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader,
  TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage, TabHomePage, TabUserPage,  ModalDownloadPage, MultipleChoiceSlides, MatchingWords, LearningSlides, AboutUsPage, SentencePage, AuthorInfo } from '../pages';
import { LocalStorageService, SettingService, SliderService, DbService, AudioService, AuthService, DownloadService, AnalyticsService, LoaderService } from '../services';
import { AudioBar, AudioPlayer, AudioSetting, CustomCheckbox, PlaylistOptions, SelectedWords, ProgressBarComponent, ModControllerComponent, MultipleChoiceQuestion, SettingWord } from '../components';
import { CustomDatePipe, CustomTimePipe } from '../pipes';

export function makeTranslateFactory(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

export function makeStorageFactory() {
  return new Storage(['sqlite', 'websql', 'indexeddb'], { name: 'io.techybrain.minagoi' });
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage, TabHomePage, TabUserPage, ModalDownloadPage, MultipleChoiceSlides, MatchingWords, LearningSlides, AboutUsPage, SentencePage,
    AudioBar, AudioPlayer, AudioSetting, CustomCheckbox, PlaylistOptions, SelectedWords, ProgressBarComponent,ModControllerComponent,MultipleChoiceQuestion, SettingWord, AuthorInfo,
    CustomDatePipe, CustomTimePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: makeTranslateFactory,
      deps: [Http],
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, PlaylistOptions, SelectedWords, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage, TabHomePage, TabUserPage, ModalDownloadPage, MultipleChoiceSlides, MatchingWords, LearningSlides, AboutUsPage, SentencePage, SettingWord, AuthorInfo
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    LocalStorageService, SettingService, SliderService, DbService, AudioService, AuthService, DownloadService, AnalyticsService, LoaderService,
    {
      provide: Storage,
      useFactory: makeStorageFactory,
    }
  ],
})
export class AppModule {}
