import { Component, OnInit } from '@angular/core';
import { Datastream, StaReadInterfaceService } from '@helgoland/core';

import { AppConfig } from './../config/app.config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datastreams: Datastream[];

  constructor(
    private sta: StaReadInterfaceService
  ) { }

  ngOnInit() {
    this.sta.getDatastreams(AppConfig.settings.sta.http).subscribe(
      datastreams => this.datastreams = datastreams.value,
      error => console.error(error)
    );
  }

}
