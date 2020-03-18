import 'leaflet-rotatedmarker';

import { AfterViewInit, Component } from '@angular/core';
import { LayerMap, MapCache } from '@helgoland/map';
import * as L from 'leaflet';

import { StaMqttInterfaceService } from '../../services/sta-mqtt-interface/sta-mqtt-interface.service';

@Component({
  selector: 'app-live-map',
  templateUrl: './live-map.component.html',
  styleUrls: ['./live-map.component.scss']
})
export class LiveMapComponent implements AfterViewInit {

  public mapOptions: L.MapOptions = { dragging: true, zoomControl: true, boxZoom: true };
  public layerControlOptions: L.Control.LayersOptions = { position: 'bottomleft' };
  public zoomControlOptions: L.Control.ZoomOptions = { position: 'topleft' };
  public overlayMaps: LayerMap = new Map();
  public baseMaps: LayerMap = new Map();

  private lastLong: number;
  private lastLat: number;
  private lastCoG: number;
  private polyLine: L.Polyline;
  private map: L.Map;
  private ship: L.Marker;

  private shipIcon = L.icon({
    iconUrl: 'assets/boot.png',
    iconSize: [75, 39], // size of the icon
    iconAnchor: [37, 20], // point of the icon which will correspond to marker's location
  });

  constructor(
    private mapCache: MapCache,
    private staMqtt: StaMqttInterfaceService
  ) { }

  ngAfterViewInit(): void {
    this.map = this.mapCache.getMap('map-view');
    this.map.setZoom(16);

    this.polyLine = L.polyline([]).addTo(this.map);

    this.staMqtt.subscribeDatastreamObservations('ES_GDC_longitude').subscribe(
      observation => this.setLongitude(Number.parseFloat(observation.result))
    );

    this.staMqtt.subscribeDatastreamObservations('ES_GDC_latitude').subscribe(
      observation => this.setLatitude(Number.parseFloat(observation.result))
    );

    this.staMqtt.subscribeDatastreamObservations('ES_GDC_course_over_ground').subscribe(
      observation => this.setCoG(Number.parseFloat(observation.result))
    );
  }

  setLatitude(lat: number): void {
    this.lastLat = lat;
    this.setCoords();
  }

  setLongitude(lon: number): void {
    this.lastLong = lon;
    this.setCoords();
  }

  setCoG(course: number) {
    this.lastCoG = course;
    this.setCoords();
  }

  setCoords() {
    if (this.lastLat && this.lastLong) {
      const coords: L.LatLngTuple = [this.lastLat, this.lastLong];
      this.polyLine.addLatLng(coords);
      this.map.setView(coords, this.map.getZoom());
      this.drawMarker(coords);
      this.lastLat = null;
      this.lastLong = null;
      this.lastCoG = null;
    }
  }

  drawMarker(coords: L.LatLngTuple) {
    const angle = this.lastCoG - 90;
    if (!this.ship) {
      this.ship = L.marker(coords, { icon: this.shipIcon, rotationAngle: angle }).addTo(this.map);
    } else {
      this.ship.setLatLng(coords);
      this.ship.setRotationAngle(angle);
    }
  }

}
