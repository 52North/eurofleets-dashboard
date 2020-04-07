import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HelgolandServicesConnector, HelgolandTrajectory, InternalIdHandler, Time, TimeInterval } from '@helgoland/core';
import { TrajectoryEntryComponent } from '@helgoland/depiction';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-trajectory-entry',
  templateUrl: './custom-trajectory-entry.component.html',
  styleUrls: ['./custom-trajectory-entry.component.scss']
})
export class CustomTrajectoryEntryComponent extends TrajectoryEntryComponent implements OnChanges {

  @Input() public timeInterval: TimeInterval;

  public hasData = true;

  constructor(
    protected servicesConnector: HelgolandServicesConnector,
    protected internalIdHandler: InternalIdHandler,
    protected translateSrvc: TranslateService,
    protected timeSrvc: Time
  ) {
    super(servicesConnector, internalIdHandler, translateSrvc);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeInterval && this.timeInterval) {
      this.checkHasData();
    }
  }

  protected setTrajectory(trajectory: HelgolandTrajectory) {
    super.setTrajectory(trajectory);
    this.checkHasData();
  }

  private checkHasData() {
    if (this.timeInterval && this.dataset && this.dataset.firstValue && this.dataset.lastValue) {
      this.hasData = this.timeSrvc.overlaps(this.timeInterval, this.dataset.firstValue.timestamp, this.dataset.lastValue.timestamp);
    }
  }
}
