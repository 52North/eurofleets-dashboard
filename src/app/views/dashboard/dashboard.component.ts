import { Component, OnInit } from '@angular/core';
import { StaReadInterfaceService } from '@helgoland/core';

import { AppConfig } from '../../config/app.config';
import { ShipSelectionService } from '../../services/ship-selection/ship-selection.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datastreams: string[];

  public courseOverGroundID;

  public error: string;

  constructor(
    private sta: StaReadInterfaceService,
    private shipSelection: ShipSelectionService,
  ) { }

  ngOnInit() {
    this.shipSelection.selectedShip.subscribe(ship => this.loadThing(ship['@iot.id']));
  }

  private loadThing(id: string) {
    this.datastreams = [];
    this.sta.getThing(AppConfig.settings.sta.http, id).subscribe(thing => {
      console.log(`Loaded Thing: ${thing['@iot.id']}`);
      this.sta.getDatastreamsByNavigationLink(thing['Datastreams@iot.navigationLink']).subscribe(res => {
        const dsIDs = res.value.map(e => e['@iot.id']);
        this.courseOverGroundID = dsIDs.find(e => e.indexOf(AppConfig.settings.courseOverGroudLiveMapping) > -1);
        AppConfig.settings.dashboardDatastreamMapping.forEach(mds => {
          const dsid = dsIDs.find(e => e.indexOf(mds) > -1);
          if (dsid) {
            this.datastreams.push(dsid);
          }
        });
      });
    });
  }
}
