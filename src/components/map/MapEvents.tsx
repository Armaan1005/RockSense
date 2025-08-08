'use client';

import * as React from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple, PlacingMode, HeatmapDataPoint } from '@/types';
import { heatmapLayer } from './HeatmapLayer';

interface MapEventsProps {
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  placingMode: PlacingMode;
  baseLocation: LatLngTuple | null;
  avalancheZone: LatLngTuple[];
  heatmapData: HeatmapDataPoint[];
}

const MapEvents: React.FC<MapEventsProps> = ({
  onMapClick,
  placingMode,
  baseLocation,
  avalancheZone,
  heatmapData,
}) => {
  const map = useMap();
  const heatmapLayerRef = React.useRef<any>(null);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  React.useEffect(() => {
    if (placingMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [placingMode, map]);

  React.useEffect(() => {
    // Recenter map when data changes
    if (baseLocation) {
        map.setView(baseLocation, 14);
    } else if (avalancheZone.length > 0) {
        const bounds = L.latLngBounds(avalancheZone);
        map.fitBounds(bounds, { padding: [50, 50]});
    }
  }, [baseLocation, avalancheZone, map]);

  React.useEffect(() => {
    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = heatmapLayer(heatmapData).addTo(map);
    } else {
      heatmapLayerRef.current.setData(heatmapData, map);
    }
  }, [heatmapData, map]);

  return null; // This component does not render anything
};

export default MapEvents;
