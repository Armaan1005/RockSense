
'use client';

import * as React from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngTuple, RescueRoute, Team, PlacingMode, HeatmapDataPoint } from '@/types';
import { baseIcon, victimIcon } from './CustomIcons';
import AnimatedTeam from './AnimatedTeam';
import L from 'leaflet';
import { TEAM_COLORS } from '../ClientDashboard';
import MapEvents from './MapEvents';

interface MapComponentProps {
  baseLocation: LatLngTuple | null;
  victimLocations: LatLngTuple[];
  avalancheZone: LatLngTuple[];
  routes: RescueRoute[];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  teams: Team[];
  placingMode: PlacingMode;
  heatmapData: HeatmapDataPoint[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  baseLocation,
  victimLocations,
  avalancheZone,
  routes,
  onMapClick,
  placingMode,
  heatmapData,
}) => {
  const map = useMap();

  React.useEffect(() => {
    // Recenter map when data changes
    if (baseLocation) {
        map.setView(baseLocation, 14);
    } else if (avalancheZone.length > 0) {
        const bounds = L.latLngBounds(avalancheZone);
        map.fitBounds(bounds, { padding: [50, 50]});
    }
  }, [baseLocation, avalancheZone, map]);

  return (
    <>
      <MapEvents 
        onMapClick={onMapClick} 
        placingMode={placingMode}
        heatmapData={heatmapData}
      />

      {baseLocation && <L.Marker position={baseLocation} icon={baseIcon}><L.Tooltip>Rescue Base</L.Tooltip></L.Marker>}

      {victimLocations.map((pos, index) => (
        <L.Marker key={index} position={pos} icon={victimIcon}>
          <L.Tooltip>Victim #{index + 1}</L.Tooltip>
        </L.Marker>
      ))}

      {avalancheZone.length > 2 && (
        <L.Polygon pathOptions={{ color: 'hsl(var(--destructive))', fillColor: 'hsl(var(--destructive))', fillOpacity: 0.2 }} positions={avalancheZone} />
      )}

      {routes.map((route, index) => {
        const routePoints: LatLngTuple[] = route.routeCoordinates.map(coord => {
          const [lat, lng] = coord.split(',').map(parseFloat);
          return [lat, lng];
        });

        return (
          <L.Polyline
            key={index}
            positions={routePoints}
            pathOptions={{ color: TEAM_COLORS[route.teamName] || '#fff', weight: 4, opacity: 0.8 }}
          >
            <L.Tooltip>{route.teamName}</L.Tooltip>
          </L.Polyline>
        );
      })}

      {routes.map((route, index) => (
         <AnimatedTeam key={index} route={route} victimLocations={victimLocations} />
      ))}
    </>
  );
};

export default MapComponent;
