import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Thing } from '@helgoland/core';

export interface DialogShipData {
  ships: Thing[];
}

@Component({
  selector: 'app-dialog-ship-selection',
  templateUrl: './dialog-ship-selection.component.html',
  styleUrls: ['./dialog-ship-selection.component.scss']
})
export class DialogShipSelectionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogShipSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogShipData
  ) { }

  ngOnInit() {
  }

  public selectShip(ship: Thing) {
    this.dialogRef.close(ship);
  }

}
