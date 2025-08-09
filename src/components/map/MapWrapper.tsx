
"use client";

import * as React from 'react';
import { GoogleMap, useLoadScript, MarkerF, PolygonF, PolylineF } from '@react-google-maps/api';
import type { LatLngLiteral, RescueRoute, PlacingMode, HeatmapDataPoint } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { TEAM_COLORS } from '../ClientDashboard';
import AnimatedTeam from './AnimatedTeam';

const MAP_ID = "snowtrace_map_id";

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Indian Himalayas
const center = {
  lat: 30.3234,
  lng: 79.9844
};

const mapOptions: google.maps.MapOptions = {
    mapId: MAP_ID,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'cooperative',
    mapTypeId: 'terrain'
};

const libraries: ('marker' | 'places' | 'visualization' | 'geometry')[] = ['marker', 'places', 'visualization', 'geometry'];

interface MapWrapperProps {
  baseLocation: LatLngLiteral | null;
  victimLocations: LatLngLiteral[];
  avalancheZone: LatLngLiteral[];
  routes: RescueRoute[];
  onMapClick: (e: google.maps.MapMouseEvent) => void;
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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    mapIds: [MAP_ID]
  });

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = React.useCallback(function callback() {
    mapRef.current = null;
  }, []);

  if (loadError) return <div>Error loading maps. Please check the API key and ensure billing is enabled on your Google Cloud project.</div>;
  if (!isLoaded || !window.google) return <div className="h-full w-full bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>;
  
  const baseIcon = {
    path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", // Material Design Home icon
    fillColor: 'hsl(142.1 76.2% 36.3%)',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'white',
    scale: 1.2,
    anchor: new window.google.maps.Point(12, 12)
  };

  const victimIcon = {
    path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", // Material Design User icon
    fillColor: 'hsl(var(--destructive))',
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: 'white',
    scale: 1,
    anchor: new window.google.maps.Point(12, 12)
  };

  const avalanchePointIcon = {
    path: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    scale: 0.8,
    fillColor: 'hsl(var(--destructive))',
    fillOpacity: 0.8,
    strokeWeight: 1,
    strokeColor: 'white',
    anchor: new window.google.maps.Point(12, 12)
  }


  return (
    <div className='h-full w-full p-4 relative'>
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={9}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
            onClick={onMapClick}
            mapContainerClassName='rounded-md'
        >
            {/* Markers, Polygons, etc. */}
            {baseLocation && (
                <MarkerF position={baseLocation} title="Rescue Base" icon={baseIcon} />
            )}

            {victimLocations.map((pos, index) => (
                <MarkerF key={index} position={pos} title={`Victim #${index + 1}`} icon={victimIcon} label={{ text: `${index + 1}`, color: 'red', fontSize: '10px', fontWeight: 'bold' }} />
            ))}

            {avalancheZone.map((pos, index) => (
              <MarkerF key={`av-point-${index}`} position={pos} icon={avalanchePointIcon} />
            ))}

            {avalancheZone.length > 2 && (
                <PolygonF
                    paths={avalancheZone}
                    options={{
                        strokeColor: 'hsl(var(--destructive))',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: 'hsl(var(--destructive))',
                        fillOpacity: 0.2
                    }}
                />
            )}

            {routes.map((route, index) => {
                 const routePoints: LatLngLiteral[] = route.routeCoordinates.map(coord => {
                    const [lat, lng] = coord.split(',').map(parseFloat);
                    return { lat, lng };
                  });

                  return (
                    <PolylineF
                        key={index}
                        path={routePoints}
                        options={{
                            strokeColor: TEAM_COLORS[route.teamName] || '#fff',
                            strokeOpacity: 0.8,
                            strokeWeight: 5,
                        }}
                    />
                  )
            })}
           
            {routes.map((route, index) => (
                <AnimatedTeam key={index} route={route} victimLocations={victimLocations} />
            ))}
        </GoogleMap>
    </div>
  );
};

export default MapWrapper;
