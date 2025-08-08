"use client";

import dynamic from 'next/dynamic';
import * as React from 'react';
import type { LatLngTuple, RescueRoute, Team, PlacingMode } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapComponent from './MapComponent';

interface MapWrapperProps {
  baseLocation: LatLngTuple | null;
  victimLocations: LatLngTuple[];
  avalancheZone: LatLngTuple[];
  routes: RescueRoute[];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  teams: Team[];
  placingMode: PlacingMode;
}

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <div className='h-full w-full p-4'>
            <Skeleton className="w-full h-full" />
        </div>
    )
  }

  return (
    <div className='h-full w-full p-4'>
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
    </div>
  );
};

export default MapWrapper;
