import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatasetApiV3ConnectorProvider, HelgolandCoreModule } from '@helgoland/core';
import { HelgolandD3Module } from '@helgoland/d3';
import { HelgolandMapViewModule } from '@helgoland/map';
import { HelgolandModificationModule } from '@helgoland/modification';
import { HelgolandSelectorModule } from '@helgoland/selector';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  CustomD3TrajectoryGraphComponent,
} from './components/custom-d3-trajectory-graph/custom-d3-trajectory-graph.component';
import { DialogShipSelectionComponent } from './components/dialog-ship-selection/dialog-ship-selection.component';
import { DisplayLiveValueComponent } from './components/display-live-value/display-live-value.component';
import { LiveMapComponent } from './components/live-map/live-map.component';
import { AppConfig } from './config/app.config';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import {
  CustomTrajectoryEntryComponent,
} from './views/trajectories/custom-trajectory-entry/custom-trajectory-entry.component';
import { TrajectoriesViewComponent } from './views/trajectories/view.component';
import { ValueTableComponent } from './views/value-table/value-table.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  entryComponents: [
    DialogShipSelectionComponent,
  ],
  declarations: [
    AppComponent,
    CustomD3TrajectoryGraphComponent,
    CustomTrajectoryEntryComponent,
    DashboardComponent,
    DisplayLiveValueComponent,
    LiveMapComponent,
    TrajectoriesViewComponent,
    DialogShipSelectionComponent,
    ValueTableComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HelgolandCoreModule,
    HelgolandD3Module,
    HelgolandMapViewModule,
    HelgolandModificationModule,
    HelgolandSelectorModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] } }),
  ],
  providers: [
    DatasetApiV3ConnectorProvider,
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
