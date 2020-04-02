import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaReadInterfaceService } from '@helgoland/core';

import { AppConfig } from '../../config/app.config';

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

              this.courseOverGroundID = dsIDs.find(e => e.indexOf(AppConfig.settings.courseOverGroudMapping) > -1);

              AppConfig.settings.dashboardDatastreamMapping.forEach(mds => {
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
