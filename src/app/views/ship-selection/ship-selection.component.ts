import { Component, OnInit } from '@angular/core';
import { StaReadInterfaceService, Thing } from '@helgoland/core';

import { AppConfig } from '../../config/app.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ship-selection',
  templateUrl: './ship-selection.component.html',
  styleUrls: ['./ship-selection.component.scss']
})
export class ShipSelectionComponent implements OnInit {

  public things: Thing[];

  constructor(
    private sta: StaReadInterfaceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sta.getThings(AppConfig.settings.sta.http).subscribe(
      things => this.things = things.value,
      error => console.error(error)
    );
  }

  public openDashboard(thing: Thing) {
    this.router.navigate([`/dashboard/${thing['@iot.id']}`]);
  }

  public openTrajectory(thing: Thing) {
    this.router.navigate([`/trajectories/${thing['@iot.id']}`]);
  }

}
