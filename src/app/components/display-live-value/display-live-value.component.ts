import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatasetOptions, Datastream, Observation, StaReadInterfaceService, Timespan } from '@helgoland/core';
import { AdditionalData, D3PlotOptions, ExtendedDataD3TimeseriesGraphComponent } from '@helgoland/d3';
import { Subscription } from 'rxjs';

import { AppConfig } from '../../config/app.config';
import { StaMqttInterfaceService } from '../../services/sta-mqtt-interface/sta-mqtt-interface.service';
import { LAST_MEASUREMENTS_COUNT, MAX_TIMESPAN_IN_MS_FOR_CHART } from '../../services/constants';

@Component({
  selector: 'app-display-live-value',
  templateUrl: './display-live-value.component.html',
  styleUrls: ['./display-live-value.component.scss']
})
export class DisplayLiveValueComponent implements OnInit, OnDestroy {

  @Input() datastreamId: string;

  @Output() hasData: EventEmitter<boolean> = new EventEmitter();

  public observation: Observation;
  public datastream: Datastream;

  public subscriptions: Subscription[] = [];

  public additionalData: AdditionalData;
  public timespan!: Timespan;

  public graphOptions: D3PlotOptions = {
    yaxis: true
  };

  public datasetOptions: Map<string, DatasetOptions> = new Map();

  public selectedIds: string[] = [];

  public graphLoading: boolean;

  public interval: NodeJS.Timer;

  constructor(
    private staMqtt: StaMqttInterfaceService,
    private sta: StaReadInterfaceService,
  ) {
    const end = new Date().getTime();
    const diff = 60000;
    this.timespan = new Timespan(end - diff, end);
   }

  ngOnInit() {
    this.subscriptions.push(this.sta.getDatastream(AppConfig.settings.sta.http, this.datastreamId).subscribe(
      ds => this.setDatastream(ds),
      error => console.error(error)
    ));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private startListeningLiveData() {
    this.subscriptions.push(this.staMqtt.subscribeDatastreamObservations(this.datastreamId).subscribe(observation => {
      this.addObservationToDataArray(observation);
      this.setNewTimespan();
    }));
  }

  private addObservationToDataArray(observation: Observation) {
    this.hasData.emit(true);
    this.observation = observation;
    const timestamp = new Date(observation.phenomenonTime).getTime();
    const value = Number.parseFloat(observation.result);
    this.additionalData.data.push({ timestamp, value });
  }

  private setDatastream(ds: Datastream): void {
    this.datastream = ds;

    const options = new DatasetOptions('addData', 'red');
    options.pointRadius = 3;
    options.lineWidth = 2;
    this.additionalData = {
      internalId: '',
      yaxisLabel: ds.unitOfMeasurement.symbol,
      datasetOptions: options,
      data: []
    };

    this.subscriptions.push(this.sta.getDatastreamObservationsRelation(AppConfig.settings.sta.http, this.datastreamId, {
      $top: LAST_MEASUREMENTS_COUNT,
      $orderby: 'phenomenonTime desc',
    }).subscribe(
      obs => {
        obs.value.reverse().forEach(e => this.addObservationToDataArray(e));
        setTimeout(() => this.setNewTimespan(), 100);
        this.startListeningLiveData();
      },
      error => {
        console.error(error);
        this.startListeningLiveData();
      }
    ));
  }

  private setNewTimespan() {
    if (this.additionalData.data.length > 0) {
      const end = this.additionalData.data[this.additionalData.data.length - 1].timestamp;
      let diff = MAX_TIMESPAN_IN_MS_FOR_CHART;
      if (this.additionalData.data[0].timestamp) {
        diff = end - this.additionalData.data[0].timestamp;
      }
      diff = diff > MAX_TIMESPAN_IN_MS_FOR_CHART ? MAX_TIMESPAN_IN_MS_FOR_CHART : diff;
      const start = end - diff;
      let second = this.additionalData.data[1]
      this.additionalData.data = this.additionalData.data.filter(e => e.timestamp >= start - MAX_TIMESPAN_IN_MS_FOR_CHART);

      // we need at least 2 points for graph y axis to scale properly. 
      // We use second last value despite it technically being outside of max_timespan 
      if (this.additionalData.data.length == 1) {
        this.additionalData.data.push(second)
      } 
      this.timespan = new Timespan(start, end);
    }
  }

  public timespanChanged(timespan: Timespan) {
    this.timespan = timespan;
  }

  public selectTimeseries(selected: boolean, id: string) {
    if (selected) {
      if (this.selectedIds.indexOf(id) < 0) {
        this.selectedIds.push(id);
      }
    } else {
      if (this.selectedIds.indexOf(id) >= 0) {
        this.selectedIds.splice(this.selectedIds.findIndex((entry) => entry === id), 1);
      }
    }
  }

}
