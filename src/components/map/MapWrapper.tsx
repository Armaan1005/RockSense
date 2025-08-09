
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

// MapComponent is now integrated into MapWrapper to manage state and layers directly
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
  const animatedTeamsRef = React.useRef<JSX.Element[]>([]);

  // Effect to initialize the map ONCE
  React.useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [46.8527, -121.7604], // Default to Mount Rainier
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    layersRef.current.addTo(mapRef.current);
    
    // Add click event listener
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
    });

  }, [onMapClick]);

  // Effect to handle map cursor style
  React.useEffect(() => {
    if(mapContainerRef.current) {
        if (placingMode) {
            mapContainerRef.current.style.cursor = 'crosshair';
        } else {
            mapContainerRef.current.style.cursor = '';
        }
    }
  }, [placingMode]);


  // Effect to update all layers when data changes
  React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Clear all previous layers
    layersRef.current.clearLayers();
    animatedTeamsRef.current = [];

    // Add base location marker
    if (baseLocation) {
      L.marker(baseLocation, { icon: baseIcon }).bindTooltip('Rescue Base').addTo(layersRef.current);
    }

    // Add victim location markers
    victimLocations.forEach((pos, index) => {
      L.marker(pos, { icon: victimIcon }).bindTooltip(`Victim #${index + 1}`).addTo(layersRef.current);
    });

    // Add avalanche zone polygon
    if (avalancheZone.length > 2) {
      L.polygon(avalancheZone, { color: 'hsl(var(--destructive))', fillColor: 'hsl(var(--destructive))', fillOpacity: 0.2 }).addTo(layersRef.current);
    }
    
    // Add route polylines
    routes.forEach((route) => {
      const routePoints: LatLngTuple[] = route.routeCoordinates.map(coord => {
        const [lat, lng] = coord.split(',').map(parseFloat);
        return [lat, lng];
      });
      L.polyline(routePoints, { color: TEAM_COLORS[route.teamName] || '#fff', weight: 4, opacity: 0.8 }).bindTooltip(route.teamName).addTo(layersRef.current);
    });

    // Add heatmap
    if (heatmapData.length > 0) {
        heatmapLayer(heatmapData).addTo(layersRef.current)
    }

    // Recenter map
    if (baseLocation) {
        map.setView(baseLocation, 14);
    } else if (avalancheZone.length > 0) {
        const bounds = L.latLngBounds(avalancheZone);
        map.fitBounds(bounds, { padding: [50, 50]});
    }

  }, [baseLocation, victimLocations, avalancheZone, routes, heatmapData]);


  return (
    <div className='h-full w-full p-4 relative'>
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        {/* We need a map context for animated teams, which react-leaflet provides. 
            This is a bit of a hack, but it's the cleanest way to integrate the animated component.
            We render a "dummy" MapContainer that doesn't render a map div but provides context.
        */}
        {mapRef.current && (
             <L.MapContext.Provider value={{map: mapRef.current}}>
                {routes.map((route, index) => (
                    <AnimatedTeam key={index} route={route} victimLocations={victimLocations} />
                ))}
            </L.MapContext.Provider>
        )}
    </div>
  );
};

export default MapWrapper;
