import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Datastream, Observation, StaReadInterfaceService } from '@helgoland/core';
import { Subscription } from 'rxjs';

import { AppConfig } from '../../config/app.config';
import { StaMqttInterfaceService } from '../../services/sta-mqtt-interface/sta-mqtt-interface.service';

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

  constructor(
    private staMqtt: StaMqttInterfaceService,
    private sta: StaReadInterfaceService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.sta.getDatastream(AppConfig.settings.sta.http, this.datastreamId).subscribe(
      ds => this.datastream = ds,
      error => console.error(error)
    ));

    this.subscriptions.push(this.staMqtt.subscribeDatastreamObservations(this.datastreamId).subscribe(observation => {
      console.log(`'${this.datastreamId}' with ${observation.result} at ${observation.phenomenonTime}`);
      this.observation = observation;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
