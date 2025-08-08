'use client';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapDataPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

export const HeatmapLayer = L.Layer.extend({
  initialize: function (this: any, data: HeatmapDataPoint[]) {
    this._data = data;
    this._heatLayer = null;
  },

  onAdd: function (this: any, map: L.Map) {
    if (this._data && this._data.length > 0) {
      const points = this._data.map((p: HeatmapDataPoint) => [
        p.latitude,
        p.longitude,
        p.intensity,
      ]);

      this._heatLayer = (L as any).heatLayer(points, {
        radius: 35,
        blur: 20,
        maxZoom: 18,
        max: 1.0,
        gradient: {
          0.1: 'blue',
          0.3: 'cyan',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red',
        },
      });

      map.addLayer(this._heatLayer);
    }
  },

  onRemove: function (this: any, map: L.Map) {
    if (this._heatLayer) {
      map.removeLayer(this._heatLayer);
    }
  },

  setData: function (this: any, data: HeatmapDataPoint[], map: L.Map) {
    this.onRemove(map);
    this._data = data;
    this.onAdd(map);
  },
});

export function heatmapLayer(data: HeatmapDataPoint[]) {
  return new (HeatmapLayer as any)(data);
}
