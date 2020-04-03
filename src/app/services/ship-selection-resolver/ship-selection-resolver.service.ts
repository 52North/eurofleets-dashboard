import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, Observer } from 'rxjs';

import { ShipSelectionService } from '../ship-selection/ship-selection.service';

@Injectable({
  providedIn: 'root'
})
export class ShipSelectionResolverService implements Resolve<string> {

  constructor(
    private shipSelection: ShipSelectionService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): string | Observable<string> | Promise<string> {
    // const shipId = route.paramMap.get('id');
    // if (shipId) {
    //   if (this.shipSelection.hasShip(shipId)) {
    //     return shipId;
    //   } else {
    //     return this.shipSelection.openSelection();
    //   }
    // } else {
    //   return this.shipSelection.openSelection();
    // }

    return new Observable<string>((observer: Observer<string>) => {
      this.shipSelection.selectedShip.subscribe(ship => {
        if (ship) {
          observer.next(ship['@iot.id']);
          observer.complete();
        } else {
          this.shipSelection.openSelection();
        }
      });
    });
  }

}
