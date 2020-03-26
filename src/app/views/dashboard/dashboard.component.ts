import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datastreams: string[];

  ngOnInit() {
    this.datastreams = [
      'ES_GDC_course_over_ground',
      'ES_GDC_heading',
      'ES_GDC_speed_over_ground'
    ];
  }

}
