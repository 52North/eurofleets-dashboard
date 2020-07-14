import 'leaflet-rotatedmarker';

import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observation, StaReadInterfaceService } from '@helgoland/core';
import { LayerMap, MapCache } from '@helgoland/map';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

import { LAST_MEASUREMENTS_COUNT } from '../../services/constants';
import { StaMqttInterfaceService } from '../../services/sta-mqtt-interface/sta-mqtt-interface.service';
import { AppConfig } from './../../config/app.config';

export const SHIP_ICON = L.icon({
  iconUrl: 'assets/boot.png',
  iconSize: [75, 39], // size of the icon
  iconAnchor: [37, 20], // point of the icon which will correspond to marker's location
});

@Component({
  selector: 'app-live-map',
  templateUrl: './live-map.component.html',
  styleUrls: ['./live-map.component.scss']
})
export class LiveMapComponent implements AfterViewInit, OnChanges, OnDestroy {

  public mapOptions: L.MapOptions = { dragging: true, zoomControl: true, boxZoom: true };
  public layerControlOptions: L.Control.LayersOptions = { position: 'bottomleft' };
  public zoomControlOptions: L.Control.ZoomOptions = { position: 'topleft' };
  public overlayMaps: LayerMap = new Map();
  public baseMaps: LayerMap = new Map();

  @Input() public courseOverGround: string;

  private polyLine: L.Polyline;
  private map: L.Map;
  private ship: L.Marker;
  private positionSubscription: Subscription;

  private lastCourse: number;
  private lastPos: L.LatLngTuple;

  constructor(
    private mapCache: MapCache,
    private staMqtt: StaMqttInterfaceService,
    private sta: StaReadInterfaceService
  ) { }

  ngAfterViewInit(): void {
    this.map = this.mapCache.getMap('map-view');
    this.map.setZoom(18);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.courseOverGround && this.courseOverGround) {
      this.reset();
      this.sta.getDatastreamObservationsRelation(
        AppConfig.settings.sta.http,
        this.courseOverGround,
        { $top: LAST_MEASUREMENTS_COUNT, $orderby: 'phenomenonTime desc' }
      ).subscribe(res => {
        if (res.value.length > 0) {
          res.value.reverse().forEach(e => this.setValues(e));
        }
        this.drawMarker();
        this.centerMap();
      });
      this.positionSubscription = this.staMqtt.subscribeDatastreamObservations(this.courseOverGround).subscribe(
        observation => {
          console.log(`New ship position at ${observation.phenomenonTime}`);
          this.setValues(observation);
          this.centerMap();
          this.drawMarker();
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.positionSubscription.unsubscribe();
  }

  private setValues(observation: Observation) {
    if (!this.polyLine) {
      this.polyLine = L.polyline([]).addTo(this.map);
    }
    try {
      this.lastCourse = Number.parseFloat(observation.result);
      const nameValPair = observation.parameters.find(e => e.name === 'http://www.opengis.net/def/param-name/OGC-OM/2.0/samplingGeometry');
      const geom = (nameValPair.value as any) as GeoJSON.Point;
      const lat = geom.coordinates[1];
      const lon = geom.coordinates[0];
      this.lastPos = [lat, lon];
      this.polyLine.addLatLng(this.lastPos);
    } catch (error) {
      console.error(`Could not parse the geometry: ${error}`);
    }
  }

  private centerMap() {
    if (this.lastPos) {
      console.log(`Pos of ship: ${this.lastPos}`);
      this.map.setView(this.lastPos, this.map.getZoom());
    }
  }

  private drawMarker() {
    if (this.lastPos && !isNaN(this.lastCourse)) {
      const angle = this.lastCourse - 90;
      if (!this.ship) {
        this.ship = L.marker(this.lastPos, { icon: SHIP_ICON, rotationAngle: angle }).addTo(this.map);
      } else {
        this.ship.setLatLng(this.lastPos);
        this.ship.setRotationAngle(angle);
      }
    }
  }

  private reset() {
    if (this.positionSubscription && !this.positionSubscription.closed) {
      this.positionSubscription.unsubscribe();
    }
    if (this.polyLine) {
      this.polyLine.remove();
      this.polyLine = null;
    }
  }

}
