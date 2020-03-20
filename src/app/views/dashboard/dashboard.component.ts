import { Component, OnInit } from '@angular/core';
import { StaReadInterfaceService } from '@helgoland/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datastreams: string[];

  constructor(
    private sta: StaReadInterfaceService
  ) { }

  ngOnInit() {
    // this.sta.getDatastreams(AppConfig.settings.sta.http).subscribe(
    //   datastreams => this.datastreams = datastreams.value.map(e => e['@iot.id']),
    //   error => console.error(error)
    // );
    this.datastreams = [
      'ES_GDC_course_over_ground',
      'ES_GDC_heading',
      'ES_GDC_speed_over_ground'
    ];
  }

}
