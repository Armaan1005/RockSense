
"use client";

import * as React from 'react';
import type { LatLngTuple, RescueRoute, Team, PlacingMode, HeatmapDataPoint } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { baseIcon, victimIcon } from './CustomIcons';
import { TEAM_COLORS } from '../ClientDashboard';
import { heatmapLayer } from './HeatmapLayer';
import AnimatedTeam from './AnimatedTeam';

interface MapWrapperProps {
  baseLocation: LatLngTuple | null;
  victimLocations: LatLngTuple[];
  avalancheZone: LatLngTuple[];
  routes: RescueRoute[];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  teams: Team[];
  placingMode: PlacingMode;
  heatmapData: HeatmapDataPoint[];
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  baseLocation,
  victimLocations,
  avalancheZone,
  routes,
  onMapClick,
  placingMode,
  heatmapData,
}) => {
  const mapRef = React.useRef<L.Map | null>(null);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const layersRef = React.useRef<L.LayerGroup>(new L.LayerGroup());
  const heatmapLayerRef = React.useRef<any>(null);

  // Effect to initialize the map ONCE
  React.useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [30.3234, 79.9844], // Default to Indian Himalayas
      zoom: 9,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    layersRef.current.addTo(mapRef.current);
    
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
    });

    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to handle map cursor style and click events based on placingMode
  React.useEffect(() => {
    if(mapContainerRef.current) {
        if (placingMode) {
            mapContainerRef.current.style.cursor = 'crosshair';
        } else {
            mapContainerRef.current.style.cursor = '';
        }
    }
    if (mapRef.current) {
        const map = mapRef.current;
        // Remove previous listener to avoid duplicates
        map.off('click'); 
        map.on('click', (e: L.LeafletMouseEvent) => {
            if (placingMode) {
                onMapClick(e.latlng);
            }
        });
    }
  }, [placingMode, onMapClick]);


  // Effect to update all static layers when data changes
  React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    layersRef.current.clearLayers();

    if (baseLocation) {
      L.marker(baseLocation, { icon: baseIcon }).bindTooltip('Rescue Base').addTo(layersRef.current);
    }

    victimLocations.forEach((pos, index) => {
      L.marker(pos, { icon: victimIcon }).bindTooltip(`Victim #${index + 1}`).addTo(layersRef.current);
    });

    avalancheZone.forEach((pos) => {
      L.circleMarker(pos, { radius: 5, color: 'hsl(var(--destructive))', fillColor: 'hsl(var(--destructive))', fillOpacity: 0.8 }).addTo(layersRef.current);
    });

    if (avalancheZone.length > 2) {
      L.polygon(avalancheZone, { color: 'hsl(var(--destructive))', fillColor: 'hsl(var(--destructive))', fillOpacity: 0.2 }).addTo(layersRef.current);
    }
    
    routes.forEach((route) => {
      const routePoints: LatLngTuple[] = route.routeCoordinates.map(coord => {
        const [lat, lng] = coord.split(',').map(parseFloat);
        return [lat, lng];
      });
      L.polyline(routePoints, { color: TEAM_COLORS[route.teamName] || '#fff', weight: 4, opacity: 0.8 }).bindTooltip(route.teamName).addTo(layersRef.current);
    });

    if (routes.length > 0) { // Only fit bounds when routes are generated
      const allPoints = [
          ...(baseLocation ? [baseLocation] : []),
          ...victimLocations,
          ...routes.flatMap(r => r.routeCoordinates.map(c => c.split(',').map(parseFloat) as LatLngTuple))
      ];

      if(allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50]});
      }
    }

  }, [baseLocation, victimLocations, avalancheZone, routes]);

  // Effect for heatmap layer
   React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = heatmapLayer([]).addTo(map);
    }
    
    if (heatmapData.length > 0) {
        heatmapLayerRef.current.setData(heatmapData, map);
    } else {
        heatmapLayerRef.current.setData([], map);
    }

  }, [heatmapData]);


  return (
    <div className='h-full w-full p-4 relative'>
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        {mapRef.current && routes.map((route, index) => (
            <AnimatedTeam 
                key={`${route.teamName}-${index}`} 
                map={mapRef.current}
                route={route} 
                victimLocations={victimLocations} 
            />
        ))}
    </div>
  );
};

export default MapWrapper;
