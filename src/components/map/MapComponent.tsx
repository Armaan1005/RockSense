'use client';

import * as React from 'react';
import { useMap, Marker, Polygon, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import type { LatLngTuple, RescueRoute, Team, PlacingMode } from '@/types';
import { baseIcon, victimIcon } from './CustomIcons';
import AnimatedTeam from './AnimatedTeam';
import L from 'leaflet';
import { TEAM_COLORS } from '../ClientDashboard';

interface MapComponentProps {
  baseLocation: LatLngTuple | null;
  victimLocations: LatLngTuple[];
  avalancheZone: LatLngTuple[];
  routes: RescueRoute[];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  teams: Team[];
  placingMode: PlacingMode;
}

const MapClickHandler = ({ onClick, placingMode }: { onClick: (latlng: L.LatLng) => void, placingMode: PlacingMode }) => {
  const map = useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  
  React.useEffect(() => {
    if (placingMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [placingMode, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  baseLocation,
  victimLocations,
  avalancheZone,
  routes,
  onMapClick,
  teams,
  placingMode,
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const map = useMap();

  React.useEffect(() => {
    setIsClient(true);
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
      <MapClickHandler onClick={onMapClick} placingMode={placingMode} />

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
