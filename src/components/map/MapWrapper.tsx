'use client';

import dynamic from 'next/dynamic';
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
  return (
    <div className='h-full w-full p-4'>
        <MapComponentWithNoSSR {...props} />
    </div>
  );
};

export default MapWrapper;
