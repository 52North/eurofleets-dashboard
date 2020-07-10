import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { Component, OnInit } from '@angular/core';
import { Thing } from '@helgoland/core';

import { ShipSelectionService } from './services/ship-selection/ship-selection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public selectedShip: Thing;

  constructor(
    public shipSelection: ShipSelectionService
  ) { 

    registerLocaleData(localeDe);
  }

  ngOnInit(): void {
    this.shipSelection.selectedShip.subscribe(ship => this.selectedShip = ship);
  }

}
