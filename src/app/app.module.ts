import { NgModule, ErrorHandler } from '@angular/core';
import { Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader,
  TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage } from '../pages';
import { LocalStorageService, SettingService, SliderService, DbService, AudioService, AuthService } from '../services';
import { AudioBar, AudioPlayer, AudioSetting, CustomCheckbox, PlaylistOptions, SelectedWords } from '../components';
import { CustomDatePipe } from '../custom-date.pipe';

@NgModule({
  declarations: [
    MyApp,
    LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage,
    AudioBar, AudioPlayer, AudioSetting, CustomCheckbox, PlaylistOptions, SelectedWords,
    CustomDatePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
      deps: [Http],
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage, HomePage, NewsPage, NewsDetail, UnitsPage, WordsPage, PlaylistOptions, SelectedWords, WordSlides, PlaylistsPage, PlaylistDetail, FeedbackPage, SettingPage, PlaygroundPage
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    LocalStorageService, SettingService, SliderService, DbService, AudioService, AuthService,
    {
      provide: Storage,
      useFactory: () => new Storage(['sqlite', 'websql', 'indexeddb'], { name: 'io.techybrain.minagoi' }),
    }
  ],
})
export class AppModule {}
