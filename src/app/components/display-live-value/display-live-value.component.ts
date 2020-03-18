import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DatasetOptions, Datastream, Observation, StaReadInterfaceService, Timespan } from '@helgoland/core';
import { AdditionalData, D3PlotOptions } from '@helgoland/d3';
import { Subscription } from 'rxjs';

import { AppConfig } from '../../config/app.config';
import { StaMqttInterfaceService } from '../../services/sta-mqtt-interface/sta-mqtt-interface.service';

const MAX_TIMESPAN_CHART = 60000;

@Component({
  selector: 'app-display-live-value',
  templateUrl: './display-live-value.component.html',
  styleUrls: ['./display-live-value.component.scss']
})
export class DisplayLiveValueComponent implements OnInit, OnDestroy {

  @Input() datastreamId: string;

  public observation: Observation;
  public datastream: Datastream;

  public subscriptions: Subscription[] = [];

  public additionalData: AdditionalData[] = [];
  public timespan: Timespan;

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
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.sta.getDatastream(AppConfig.settings.sta.http, this.datastreamId).subscribe(
      ds => this.setDatastream(ds),
      error => console.error(error)
    ));

    // this.subscriptions.push(this.sta.getDatastreamObservationsRelation(AppConfig.settings.sta.http, this.datastreamId, {
    //   $top: 1,
    //   $orderby: 'phenomenonTime'
    // }).subscribe(
    //   obs => {
    //     if (obs['@iot.count'] > 0) {
    //       debugger;
    //     }
    //   },
    //   error => console.error(error)
    // ));

    this.subscriptions.push(this.staMqtt.subscribeDatastreamObservations(this.datastreamId).subscribe(observation => {
      this.observation = observation;
      const timestamp = new Date(observation.phenomenonTime).getTime();
      const value = Number.parseFloat(observation.result);
      this.additionalData[0].data.push({ timestamp, value });
      this.setNewTimespan(timestamp);
    }));
  }

  private setDatastream(ds: Datastream): void {
    this.datastream = ds;

    const options = new DatasetOptions('addData', 'red');
    options.pointRadius = 2;
    options.lineWidth = 2;
    this.additionalData = [{
      internalId: '',
      yaxisLabel: ds.unitOfMeasurement.symbol,
      datasetOptions: options,
      data: []
    }];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private setNewTimespan(end: number) {
    let diff = MAX_TIMESPAN_CHART;
    if (this.additionalData[0].data[0].timestamp) {
      diff = end - this.additionalData[0].data[0].timestamp;
    }
    diff = diff > MAX_TIMESPAN_CHART ? MAX_TIMESPAN_CHART : diff;
    this.timespan = new Timespan(end - diff, end);
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
