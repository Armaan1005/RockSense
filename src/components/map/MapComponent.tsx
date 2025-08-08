'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip } from 'react-leaflet';
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
  const map = L.useMapEvents({
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

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <MapContainer
      center={[46.8527, -121.7604]} // Default to Mount Rainier
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isClient && <MapClickHandler onClick={onMapClick} placingMode={placingMode} />}

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
    </MapContainer>
  );
};

export default MapComponent;
