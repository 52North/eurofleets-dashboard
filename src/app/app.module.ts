import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HelgolandCoreModule } from '@helgoland/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisplayLiveValueComponent } from './components/display-live-value/display-live-value.component';
import { AppConfig } from './config/app.config';
import { DashboardComponent } from './views/dashboard/dashboard.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    DisplayLiveValueComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    HelgolandCoreModule,
    AppRoutingModule
  ],
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
