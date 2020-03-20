import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
    DatasetOptions,
    DatasetType,
    HelgolandServicesConnector,
    HelgolandTrajectory,
    InternalIdHandler,
    LocatedTimeValueEntry,
    Timespan,
} from '@helgoland/core';
import { D3AxisType, D3GraphOptions, D3SelectionRange } from '@helgoland/d3';
import { MapCache } from '@helgoland/map';
import L from 'leaflet';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { isUndefined } from 'util';

import { SHIP_ICON } from '../../components/live-map/live-map.component';
import { TrajectoriesService } from './trajectories.service';

const DEFAULT_START_TIME_INTERVAL = 500;

@Component({
    selector: 'app-trajectories-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
})
export class TrajectoriesViewComponent implements OnInit, OnDestroy {

    public selection: D3SelectionRange;

    public highlightGeometry: GeoJSON.GeoJsonObject;

    public zoomToGeometry: GeoJSON.LineString;

    public timespan: Timespan;

    public datasetIds: Array<string>;

    public trajectory: HelgolandTrajectory;

    public loading: boolean;

    public geometry: GeoJSON.LineString;

    public options: Map<string, DatasetOptions>;

    public editableOption: DatasetOptions;

    public tempColor: string;

    public graphData: LocatedTimeValueEntry[];

    public selectedTimespan: Timespan;

    private ship: L.Marker;

    @ViewChild('modalTrajectoryOptionsEditor', { static: true })
    public modalTrajectoryOptionsEditor: TemplateRef<any>;

    public graphOptions: D3GraphOptions = {
        axisType: D3AxisType.Time,
        dotted: false
    };

    public axisTypeDistance = D3AxisType.Distance;
    public axisTypeTime = D3AxisType.Time;
    public axisTypeTicks = D3AxisType.Ticks;

    public replaySubscription: Subscription;
    private lastReplayStep: number;
    private lastInterval: number;
    public highlightIndex: number;

    constructor(
        private trajectorySrvc: TrajectoriesService,
        private servicesConnector: HelgolandServicesConnector,
        private internalIdHandler: InternalIdHandler,
        private mapCache: MapCache
    ) { }

    public ngOnInit() {
        this.trajectorySrvc.addDataset('http://localhost:8080/api/__2', new DatasetOptions('http://localhost:8080/api/__2', 'red'));
        this.trajectorySrvc.addDataset('http://localhost:8080/api/__3', new DatasetOptions('http://localhost:8080/api/__3', 'blue'));
        this.trajectorySrvc.addDataset('http://localhost:8080/api/__4', new DatasetOptions('http://localhost:8080/api/__4', 'green'));
        this.datasetIds = this.trajectorySrvc.datasetIds;
        this.options = this.trajectorySrvc.datasetOptions;
        if (this.trajectorySrvc.hasDatasets()) {
            this.loading = true;
            const internalId = this.internalIdHandler.resolveInternalId(this.datasetIds[0]);
            this.servicesConnector.getDataset(internalId, { type: DatasetType.Trajectory }).subscribe(
                trajectory => {
                    this.trajectory = trajectory;
                    this.timespan = new Timespan(trajectory.firstValue.timestamp, trajectory.lastValue.timestamp);
                    this.selectedTimespan = this.timespan;
                    this.servicesConnector.getDatasetData(trajectory, this.timespan).subscribe(
                        data => {
                            this.geometry = {
                                type: 'LineString',
                                coordinates: [],
                            };
                            this.graphData = data.values;
                            data.values.forEach(entry => this.geometry.coordinates.push(entry.geometry.coordinates));
                            this.loading = false;
                        }
                    );
                }
            );
        }
    }

    public ngOnDestroy(): void {
        if (this.replaySubscription) {
            this.replaySubscription.unsubscribe();
        }
    }

    public onChartSelectionChanged(range: D3SelectionRange) {
        this.highlightGeometry = {
            type: 'LineString',
            coordinates: this.geometry.coordinates.slice(range.from, range.to)
        } as GeoJSON.GeoJsonObject;
    }

    public onChartSelectionChangedFinished(range: D3SelectionRange) {
        this.selection = range;
        this.zoomToGeometry = {
            type: 'LineString',
            coordinates: this.geometry.coordinates.slice(range.from, range.to)
        };
        if (this.graphData) {
            const from = this.graphData[this.selection.from].timestamp;
            const to = this.selection.to < this.graphData.length ? this.graphData[this.selection.to].timestamp : this.timespan.to;
            this.selectedTimespan = new Timespan(from, to);
        }
    }

    public onChartHighlightChanged(idx: number) {
        if (this.geometry.coordinates.length <= idx) {
            if (this.ship) {
                this.ship.remove();
                this.ship = null;
            }
        } else {
            const lat = this.geometry.coordinates[idx][1];
            const lon = this.geometry.coordinates[idx][0];
            const coords: L.LatLngTuple = [lat, lon];
            const angle = this.graphData[idx].value - 90;
            const lmap = this.mapCache.getMap('trajectory');
            if (!this.ship) {
                this.ship = L.marker(coords, { icon: SHIP_ICON, rotationAngle: angle }).addTo(lmap);
            } else {
                this.ship.setLatLng(coords);
                this.ship.setRotationAngle(angle);
            }
        }
    }

    public onDottedChanged(dotted: boolean) {
        this.graphOptions.dotted = dotted;
    }

    public onAddDataset(entry: DatasetOptions) {
        this.trajectorySrvc.addDataset(entry.internalId, new DatasetOptions(entry.internalId, entry.color));
    }

    public onRemoveDataset(internalId: string) {
        this.trajectorySrvc.removeDataset(internalId);
    }

    public editOptions(option: DatasetOptions) {
        this.editableOption = option;
        // this.modalService.open(this.modalTrajectoryOptionsEditor);
    }

    public updateOption(option: DatasetOptions) {
        this.editableOption.color = this.tempColor;
        this.trajectorySrvc.updateDatasetOptions(this.editableOption, this.editableOption.internalId);
    }

    public hasVisibleDatasets(): boolean {
        return Array.from(this.options.values()).some(entry => entry.visible);
    }

    public toggleAxisType(bla: any) {
        this.graphOptions.axisType = bla.value;
    }

    public startReplay() {
        if (isUndefined(this.lastReplayStep)) {
            this.lastReplayStep = 0;
        }
        this.runReplay(DEFAULT_START_TIME_INTERVAL, this.lastReplayStep);
    }

    private runReplay(intervalTimer: number, startWith: number) {
        this.lastInterval = intervalTimer;
        this.replaySubscription = interval(intervalTimer).pipe(map(i => i + startWith))
            .subscribe(idx => this.setHighlightIndex(idx));
    }

    private setHighlightIndex(idx: number) {
        if (this.geometry.coordinates.length > idx) {
            this.lastReplayStep = idx;
            this.onChartHighlightChanged(idx);
            this.highlightIndex = idx;
        } else {
            this.replaySubscription.unsubscribe();
        }
    }

    public pauseReplay() {
        this.replaySubscription.unsubscribe();
        this.lastReplayStep += 1;
    }

    public resetReplay() {
        if (!this.replaySubscription.closed) {
            this.replaySubscription.unsubscribe();
            this.runReplay(DEFAULT_START_TIME_INTERVAL, 0);
        } else {
            this.setHighlightIndex(0);
        }
    }

    public accelerateReplay() {
        this.replaySubscription.unsubscribe();
        this.lastInterval = this.lastInterval / 2;
        this.runReplay(this.lastInterval, this.lastReplayStep);
    }

}
