import { NgModule, ErrorHandler } from '@angular/core';
import { Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader,
  TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { LoginPage } from '../pages';
import { LocalStorageService, SettingService, SliderService, DbService } from '../services';

@NgModule({
  declarations: [
    MyApp,
    LoginPage
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
    LoginPage
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
