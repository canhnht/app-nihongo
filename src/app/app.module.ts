import { NgModule, ErrorHandler } from '@angular/core';
import { Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader,
  TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home-page/home-page';
import { TabHomePage } from '../pages/tab-home-page/tab-home-page';
import { TabUserPage } from '../pages/tab-user-page/tab-user-page';
import { WordPage } from '../pages/word-page/word-page';
import { SettingWordPage } from '../pages/setting-word-page/setting-word-page';
import { PopoverWordPage } from '../pages/word-page/word-page';
import { LocalStorageService, SettingService, SliderService, DbService } from '../services';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabHomePage,
    TabUserPage,
    WordPage,
    SettingWordPage,
    PopoverWordPage
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
    HomePage,
    TabHomePage,
    TabUserPage,
    WordPage,
    SettingWordPage,
    PopoverWordPage
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    LocalStorageService,
    SettingService,
    SliderService,
    DbService,
    {
      provide: Storage,
      useFactory: () => new Storage(['sqlite', 'websql', 'indexeddb'], { name: 'io.techybrain.minagoi' }),
    }
  ],
})
export class AppModule {}
