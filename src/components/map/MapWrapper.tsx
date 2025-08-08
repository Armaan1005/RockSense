"use client";

import dynamic from 'next/dynamic';
import * as React from 'react';
import type { LatLngTuple, RescueRoute, HeatmapData, Team, PlacingMode } from '@/types';
import { Skeleton } from '../ui/skeleton';

interface MapWrapperProps {
  baseLocation: LatLngTuple | null;
  victimLocations: LatLngTuple[];
  avalancheZone: LatLngTuple[];
  routes: RescueRoute[];
  onMapClick: (latlng: { lat: number, lng: number }) => void;
  teams: Team[];
  placingMode: PlacingMode;
}

const MapComponentWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
});

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='h-full w-full p-4'>
        {isClient ? <MapComponentWithNoSSR {...props} /> : <Skeleton className="w-full h-full" />}
    </div>
  );
};

export default MapWrapper;
