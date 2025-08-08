
'use client';

import * as React from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import type { PlacingMode, HeatmapDataPoint } from '@/types';
import { heatmapLayer } from './HeatmapLayer';

interface MapEventsProps {
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  placingMode: PlacingMode;
  heatmapData: HeatmapDataPoint[];
}

const MapEvents: React.FC<MapEventsProps> = ({
  onMapClick,
  placingMode,
  heatmapData,
}) => {
  const map = useMap();
  const heatmapLayerRef = React.useRef<any>(null);

  useMapEvents({
    click(e) {
      if (placingMode) {
        onMapClick(e.latlng);
      }
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
    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = heatmapLayer(heatmapData).addTo(map);
    } else {
      heatmapLayerRef.current.setData(heatmapData, map);
    }
  }, [heatmapData, map]);

  return null; // This component does not render anything
};

export default MapEvents;
