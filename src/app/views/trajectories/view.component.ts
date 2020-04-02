import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ApiV3InterfaceService,
    DatasetOptions,
    DatasetType,
    HelgolandServicesConnector,
    HelgolandTrajectory,
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
import { AppConfig } from './../../config/app.config';
import { MatRadioChange } from '@angular/material/radio';

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

    public datasetIds: Array<string> = [];

    public trajectory: HelgolandTrajectory;

    public loading: boolean;

    public geometry: GeoJSON.LineString;

    public options: Map<string, DatasetOptions> = new Map();

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
        private servicesConnector: HelgolandServicesConnector,
        private apiV3: ApiV3InterfaceService,
        private route: ActivatedRoute,
        private mapCache: MapCache
    ) { }

    public ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.fetchProcedures(params.get('id'));
        });
    }

    private fetchProcedures(id: string) {
        this.apiV3.getProcedures(AppConfig.settings.apiUrl).subscribe(procs => {
            const proc = procs.find(e => e.domainId === id);
            if (proc) {
                this.findDatasets(proc.id);
            }
        });
    }

    private findDatasets(procId: string) {
        this.apiV3.getDatasets(AppConfig.settings.apiUrl, { procedure: procId, expanded: true }).subscribe(datasets => {
            if (datasets.length > 0) {
                AppConfig.settings.trajectoryDatasets.forEach(entry => {
                    const ds = datasets.find(e => e.parameters.phenomenon.domainId === entry.phenomenonDomainId);
                    if (ds) {
                        this.datasetIds.push(ds.internalId);
                        this.options.set(ds.internalId, new DatasetOptions(ds.internalId, entry.color));
                    }
                });
                this.servicesConnector.getDataset(datasets[0].internalId, { type: DatasetType.Trajectory }).subscribe(trajectory => {
                    this.trajectory = trajectory;
                    this.timespan = new Timespan(trajectory.firstValue.timestamp, trajectory.lastValue.timestamp);
                    this.selectedTimespan = this.timespan;
                    this.servicesConnector.getDatasetData(trajectory, this.timespan).subscribe(data => {
                        this.geometry = {
                            type: 'LineString',
                            coordinates: [],
                        };
                        this.graphData = data.values;
                        data.values.forEach(entry => this.geometry.coordinates.push(entry.geometry.coordinates));
                        this.loading = false;
                    });
                });
            }
        });
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

    public hasVisibleDatasets(): boolean {
        return Array.from(this.options.values()).some(entry => entry.visible);
    }

    public toggleAxisType(change: MatRadioChange) {
        this.graphOptions.axisType = change.value;
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
