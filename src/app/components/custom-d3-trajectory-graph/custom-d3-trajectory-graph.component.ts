import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { D3TrajectoryGraphComponent } from '@helgoland/d3';
import { isDefined } from '@angular/compiler/src/util';

@Component({
  selector: 'app-custom-d3-trajectory-graph',
  templateUrl: './custom-d3-trajectory-graph.component.html',
  styleUrls: ['./custom-d3-trajectory-graph.component.scss']
})
export class CustomD3TrajectoryGraphComponent extends D3TrajectoryGraphComponent implements OnChanges {

  @Input() public highlightIndex: number;

  public ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes.highlightIndex &&  isDefined(this.highlightIndex)) {
      this.showDiagramIndicator(this.highlightIndex);
    }
  }

}
