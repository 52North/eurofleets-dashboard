import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaReadInterfaceService } from '@helgoland/core';

import { AppConfig } from '../../config/app.config';

const MAPPED_DATASTREAMS = [
  'course_over_ground',
  'heading',
  'speed_over_ground',

  'air_temperature',
  'humidity',
  'pressure',
  'wind_direction',
  'wind_gust',
  'wind_mean',

  'water_temperature',
  'depth',
  'solar_radiation',
  'salinity',
  'raw_fluorometry',
  'density',
  'conductivity',
];

const C_O_G_MAPPING = 'course_over_ground';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datastreams: string[] = [];

  public courseOverGroundID;

  public error: string;

  constructor(
    private sta: StaReadInterfaceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.sta.getThing(AppConfig.settings.sta.http, params.get('id')).subscribe(
        thing => {
          console.log(`Loaded Thing: ${thing['@iot.id']}`);
          this.sta.getDatastreamByNavigationLink(thing['Datastreams@iot.navigationLink']).subscribe(
            res => {
              const dsIDs = res.value.map(e => e['@iot.id']);

              this.courseOverGroundID = dsIDs.find(e => e.indexOf(C_O_G_MAPPING) > -1);

              MAPPED_DATASTREAMS.forEach(mds => {
                const id = dsIDs.find(e => e.indexOf(mds) > -1);
                this.datastreams.push(id);
              });
            }
          );
        }
      );
    });
  }

}
