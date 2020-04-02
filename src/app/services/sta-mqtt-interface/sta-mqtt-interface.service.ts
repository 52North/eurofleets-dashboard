import { Injectable } from '@angular/core';
import { Observation, ObservationExpandParams, ObservationSelectParams, StaFilter } from '@helgoland/core';
import { MqttService } from 'ngx-mqtt';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

  public subscribeDatastreamObservations(
    datasetId: string,
    params?: StaFilter<ObservationSelectParams, ObservationExpandParams>
  ): Observable<Observation> {
    // TODO: add filterung: $select=result,phenomenonTime
    return this.mqttService.observe(`Datastreams(${datasetId})/Observations`).pipe(
      map(message => JSON.parse(message.payload.toString()) as Observation),
      // tap(observation => console.log(`Observation for ${datasetId} with result: ${JSON.stringify(observation, null, 2)}`))
    );
  }

  public subscribeObservations(): Observable<Observation> {
    return this.mqttService.observe(`Observations`).pipe(
      map(message => JSON.parse(message.payload.toString()) as Observation),
      tap(observation => console.log(`Observation: ${observation.result}`))
    );
  }

}
