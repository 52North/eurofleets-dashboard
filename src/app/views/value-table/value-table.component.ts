import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  ApiV3Feature,
  ApiV3InterfaceService,
  DatasetType,
  HelgolandServicesConnector,
  HelgolandTrajectory,
  HelgolandTrajectoryData,
  Timespan,
} from '@helgoland/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { AppConfig } from '../../config/app.config';
import { ShipSelectionService } from '../../services/ship-selection/ship-selection.service';

export interface ValuesElement {
  timestamp: number;
  lat: number;
  lon: number;
}

const DEFAULT_DISPLAYED_COLUMNS = ['timestamp', 'lat', 'lon'];

@Component({
  selector: 'app-value-table',
  templateUrl: './value-table.component.html',
  styleUrls: ['./value-table.component.scss']
})
export class ValueTableComponent implements OnInit {

  public procedureId: string;
  public selectedFeatureId: string;
  public features: ApiV3Feature[];

  public trajectory: HelgolandTrajectory;
  public timespan: Timespan;
  public geometry: { type: string; coordinates: any[]; };

  public displayedColumns: string[] = [...DEFAULT_DISPLAYED_COLUMNS];
  public valueColumns: {
    key: string;
    name: string;
  }[] = [];
  public dataSource: MatTableDataSource<ValuesElement> = new MatTableDataSource();
  public loading: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private shipSelection: ShipSelectionService,
    private servicesConnector: HelgolandServicesConnector,
    private snackBar: MatSnackBar,
    private apiV3: ApiV3InterfaceService,
  ) { }

  ngOnInit() {
    this.shipSelection.selectedShip.subscribe(ship => this.fetchProcedures(ship['@iot.id']));
  }

  public selectFeature(change: MatSelectChange) {
    this.getValues(change.value);
  }

  private fetchProcedures(id: string) {
    this.apiV3.getProcedures(AppConfig.settings.apiUrl).subscribe(
      procs => {
        const proc = procs.find(e => e.domainId === id);
        if (proc) {
          this.procedureId = proc.id;
          this.findTracks();
        } else {
          this.noShipFound();
        }
      },
      error => {
        console.error(error);
        this.noShipFound();
      });
  }

  private findTracks() {
    this.apiV3.getFeatures(AppConfig.settings.apiUrl, { procedures: [this.procedureId] }).subscribe(
      features => {
        if (features.length > 0) {
          this.selectedFeatureId = features[0].id;
          this.getValues(this.selectedFeatureId);
          this.features = features;
        } else {
          this.noTracksFound();
        }
      },
      error => {
        console.error(error);
        this.noTracksFound();
      });
  }

  private getValues(featureId: string) {
    this.resetScreen();
    this.loading = true;
    this.apiV3.getDatasets(
      AppConfig.settings.apiUrl,
      { procedures: [this.procedureId], features: [featureId], expanded: true }
    ).subscribe(
      datasets => {
        if (datasets.length > 0) {
          const refDs =
            datasets.find(e => e.parameters.phenomenon.domainId === AppConfig.settings.courseOverGroundTrajectoryMapping);
          if (refDs) {
            this.servicesConnector.getDataset(refDs.internalId, { type: DatasetType.Trajectory }).subscribe(
              trajectory => {
                this.timespan = new Timespan(trajectory.firstValue.timestamp, trajectory.lastValue.timestamp);
                this.servicesConnector.getDatasetData(trajectory, this.timespan).subscribe(
                  data => {
                    const aggregatedData = data.values.map(e => {
                      return {
                        timestamp: e.timestamp,
                        lat: e.geometry.coordinates[1],
                        lon: e.geometry.coordinates[0]
                      }
                    });
                    this.addData(trajectory, data, aggregatedData);
                    const additionalDataReq: Observable<{
                      ds: HelgolandTrajectory;
                      data: HelgolandTrajectoryData;
                    }>[] = [];
                    AppConfig.settings.trajectoryDatasets.forEach(entry => {
                      const ds = datasets.find(e => e.parameters.phenomenon.domainId === entry.phenomenonDomainId);
                      if (ds && ds !== refDs) {
                        additionalDataReq.push(
                          this.servicesConnector.getDataset(ds.internalId, { type: DatasetType.Trajectory })
                            .pipe(
                              concatMap(dataset => this.servicesConnector.getDatasetData(dataset, this.timespan).pipe(
                                catchError(err => of({ values: [] })),
                                map(data => ({ ds: dataset, data: data }))
                              )))
                        )
                      }
                    })
                    forkJoin(additionalDataReq).subscribe(
                      res => {
                        res.forEach(e => this.addData(e.ds, e.data, aggregatedData))
                        this.setData(aggregatedData);
                      },
                      error => {
                        this.couldNotLoadAdditionalData();
                        this.setData(aggregatedData);
                      });
                  },
                  error => {
                    this.noTrackInformationsFound();
                  });
              },
              error => {
                this.noTrackInformationsFound();
              });
          } else {
            this.noTrackInformationsFound();
          }
        } else {
          this.noTrackInformationsFound();
        }
      },
      error => {
        this.noTrackInformationsFound();
      });
  }

  private setData(aggregatedData: ValuesElement[]) {
    this.dataSource = new MatTableDataSource(aggregatedData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
  }

  private resetScreen() {
    if (this.dataSource) {
      this.dataSource.data = [];
      this.displayedColumns = [...DEFAULT_DISPLAYED_COLUMNS];
      this.valueColumns = [];
    }
  }

  private addData(trajectory: HelgolandTrajectory, data: HelgolandTrajectoryData, aggregatedData: ValuesElement[]) {
    if (data.values.length) {
      this.displayedColumns.push(trajectory.internalId);
      this.valueColumns.push({
        key: trajectory.internalId, name: trajectory.parameters.phenomenon.label
      })
      const field = trajectory.internalId;
      let incDataSource = 0;
      let incNewData = 0;

      while (incNewData < data.values.length) {
        if (aggregatedData[incDataSource] && aggregatedData[incDataSource].timestamp === data.values[incNewData].timestamp) {
          aggregatedData[incDataSource][field] = data.values[incNewData].value;
          incDataSource++;
          incNewData++;
        } else if (aggregatedData[incDataSource] && aggregatedData[incDataSource].timestamp < data.values[incNewData].timestamp) {
          incDataSource++;
        }
      }
    }
  }

  private noShipFound() {
    this.loading = false;
    this.snackBar.open('Couldn\'t find a ship', 'close', {
      verticalPosition: 'top',
      panelClass: 'warn'
    });
  }

  private noTracksFound() {
    this.loading = false;
    this.snackBar.open('Couldn\'t find a track for the ship', 'close', {
      verticalPosition: 'top',
      panelClass: 'warn'
    });
  }

  private noTrackInformationsFound() {
    this.loading = false;
    this.snackBar.open('Couldn\'t find any informations about this track', 'close', {
      verticalPosition: 'top',
      panelClass: 'warn'
    });
  }

  private couldNotLoadAdditionalData() {
    this.loading = false;
    this.snackBar.open('Couldn\'t load additional track data', 'close', {
      verticalPosition: 'top',
      panelClass: 'warn'
    });
  }
}
