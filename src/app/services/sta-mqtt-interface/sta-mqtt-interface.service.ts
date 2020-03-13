import { Injectable } from '@angular/core';
import { Observation } from '@helgoland/core';
import { MqttService } from 'ngx-mqtt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfig } from '../../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class StaMqttInterfaceService {

  private mqttService: MqttService;

  constructor() {
    this.mqttService = new MqttService({
      hostname: AppConfig.settings.sta.mqtt.hostname,
      port: AppConfig.settings.sta.mqtt.port,
      path: AppConfig.settings.sta.mqtt.path
    });
  }

  public subscribeDatastreamObservations(datasetId: string): Observable<Observation> {
    return this.mqttService.observe(`Datastreams(${datasetId})/Observations`).pipe(
      map(message => {
        return JSON.parse(message.payload.toString()) as Observation;
      })
    );
  }

}