'use client';

import * as React from 'react';
import { Marker, Polygon, Polyline, Tooltip } from 'react-leaflet';
import type { LatLngTuple, RescueRoute, Team, PlacingMode, HeatmapDataPoint } from '@/types';
import { baseIcon, victimIcon } from './CustomIcons';
import AnimatedTeam from './AnimatedTeam';
import L from 'leaflet';
import { TEAM_COLORS } from '../ClientDashboard';
import { heatmapLayer } from './HeatmapLayer';
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
  teams,
  placingMode,
  heatmapData,
}) => {
  return (
    <>
      <MapEvents 
        onMapClick={onMapClick} 
        placingMode={placingMode} 
        baseLocation={baseLocation}
        avalancheZone={avalancheZone}
        heatmapData={heatmapData}
      />

      {baseLocation && <Marker position={baseLocation} icon={baseIcon}><Tooltip>Rescue Base</Tooltip></Marker>}

      {victimLocations.map((pos, index) => (
        <Marker key={index} position={pos} icon={victimIcon}>
          <Tooltip>Victim #{index + 1}</Tooltip>
        </Marker>
      ))}

      {avalancheZone.length > 2 && (
        <Polygon pathOptions={{ color: 'hsl(var(--destructive))', fillColor: 'hsl(var(--destructive))', fillOpacity: 0.2 }} positions={avalancheZone} />
      )}

      {routes.map((route, index) => {
        const routePoints: LatLngTuple[] = route.routeCoordinates.map(coord => {
          const [lat, lng] = coord.split(',').map(parseFloat);
          return [lat, lng];
        });

        return (
          <Polyline
            key={index}
            positions={routePoints}
            pathOptions={{ color: TEAM_COLORS[route.teamName] || '#fff', weight: 4, opacity: 0.8 }}
          >
            <Tooltip>{route.teamName}</Tooltip>
          </Polyline>
        );
      })}

      {routes.map((route, index) => (
         <AnimatedTeam key={index} route={route} victimLocations={victimLocations} />
      ))}
    </>
  );
};

export default MapComponent;
