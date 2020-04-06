import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StaReadInterfaceService, Thing } from '@helgoland/core';
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  DialogShipData,
  DialogShipSelectionComponent,
} from '../../components/dialog-ship-selection/dialog-ship-selection.component';
import { AppConfig } from '../../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class ShipSelectionService {

  private shipsSubsject: AsyncSubject<Thing[]> = new AsyncSubject();

  public selectedShip: BehaviorSubject<Thing> = new BehaviorSubject(null);

  constructor(
    private sta: StaReadInterfaceService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.sta.getThings(AppConfig.settings.sta.http).subscribe(
      things => {
        this.shipsSubsject.next(things.value);
        this.shipsSubsject.complete();
      },
      error => {
        console.error(error);
        this.shipsSubsject.error(error);
        this.shipsSubsject.complete();
      }
    );
  }

  public hasShip(shipId: string): Observable<boolean> {
    return this.shipsSubsject.pipe(map(res => res.findIndex(e => e['@iot.id'] === shipId) > -1));
  }

  public openSelection() {
    this.shipsSubsject.subscribe(
      ships => {
        const dialogRef = this.dialog.open(DialogShipSelectionComponent, {
          width: '250px',
          data: { ships } as DialogShipData,
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(selectedShip => {
          console.log(`Ship selected: ${selectedShip.name}`);
          this.selectedShip.next(selectedShip);
        });
      },
      error => {
        this.snackBar.open('Couldn\'t load any ships.', 'close', {
          verticalPosition: 'top',
          panelClass: 'warn'
        });
      });
  }

}
