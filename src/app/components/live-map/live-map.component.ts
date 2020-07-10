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

  constructor(
    private mapCache: MapCache,
    private staMqtt: StaMqttInterfaceService,
    private sta: StaReadInterfaceService
  ) { }

  ngAfterViewInit(): void {
    this.map = this.mapCache.getMap('map-view');
    this.map.setZoom(16);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.courseOverGround && this.courseOverGround) {
      this.sta.getDatastreamObservationsRelation(
        AppConfig.settings.sta.http,
        this.courseOverGround,
        { $top: LAST_MEASUREMENTS_COUNT, $orderby: 'phenomenonTime desc' }
      ).subscribe(res => {
        if (res.value.length > 0) {
          res.value.reverse().forEach(e => this.setValues(e));
        }
      });
      this.positionSubscription = this.staMqtt.subscribeDatastreamObservations(this.courseOverGround).subscribe(
        observation => this.setValues(observation)
      );
    }
  }

  ngOnDestroy(): void {
    this.positionSubscription.unsubscribe();
  }

  setValues(observation: Observation) {
    if (!this.polyLine) {
      this.polyLine = L.polyline([]).addTo(this.map);
    }
    try {
      const course = Number.parseFloat(observation.result);
      const nameValPair = observation.parameters.find(e => e.name === 'http://www.opengis.net/def/param-name/OGC-OM/2.0/samplingGeometry');
      const geom = (nameValPair.value as any) as GeoJSON.Point;
      const lat = geom.coordinates[1];
      const lon = geom.coordinates[0];
      const coords: L.LatLngTuple = [lat, lon];
      this.polyLine.addLatLng(coords);
      this.map.setView(coords, this.map.getZoom());
      this.drawMarker(coords, course);
    } catch (error) {
      console.error(`Could not parse the geometry: ${error}`);
    }
  }

  drawMarker(coords: L.LatLngTuple, course: number) {
    const angle = course - 90;
    if (!this.ship) {
      this.ship = L.marker(coords, { icon: SHIP_ICON, rotationAngle: angle }).addTo(this.map);
    } else {
      this.ship.setLatLng(coords);
      this.ship.setRotationAngle(angle);
    }
  }

}
