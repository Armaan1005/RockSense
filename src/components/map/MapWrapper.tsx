"use client";

import * as React from 'react';
import type { LatLngTuple, RescueRoute, Team, PlacingMode, HeatmapDataPoint } from '@/types';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapComponent from './MapComponent';
import { Skeleton } from '../ui/skeleton';

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

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='h-full w-full p-4'>
      {isClient ? (
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
            <MapComponent {...props} />
        </MapContainer>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
};

export default MapWrapper;
