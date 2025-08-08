'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-heat';
import type { HeatmapData } from '@/types';
import L from 'leaflet';

declare module 'leaflet' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function heatLayer(latlngs: any[], options?: any): any;
}

interface HeatmapLayerProps {
  data: HeatmapData;
}

const HeatmapLayer = ({ data }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    const points = data.map(p => [p.latitude, p.longitude, p.intensity]);
    
    const heatLayer = L.heatLayer(points, {
        radius: 35,
        blur: 20,
        maxZoom: 18,
        max: 1.0,
        gradient: {
            0.1: 'blue',
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
        }
    });

    map.addLayer(heatLayer);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
};

export default HeatmapLayer;
