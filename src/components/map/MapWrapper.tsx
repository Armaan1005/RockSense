"use client";

import * as React from 'react';
import { GoogleMap, useLoadScript, MarkerF, PolygonF, PolylineF, HeatmapLayerF } from '@react-google-maps/api';
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

const libraries: ('marker' | 'places' | 'visualization')[] = ['marker', 'places', 'visualization'];

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

  const heatmapDataGoogle = React.useMemo(() => {
    return heatmapData.map(p => ({
        location: new google.maps.LatLng(p.latitude, p.longitude),
        weight: p.intensity
    }))
  }, [heatmapData]);

  const baseIcon = {
    path: window.google?.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: 'hsl(142.1 76.2% 36.3%)',
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: 'white'
  };

  const victimIcon = {
    path: window.google?.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: 'hsl(var(--destructive))',
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: 'white'
  };

  if (loadError) return <div>Error loading maps. Please check the API key.</div>;
  if (!isLoaded) return <div className="h-full w-full bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>;

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
                <MarkerF key={index} position={pos} title={`Victim #${index + 1}`} icon={victimIcon} />
            ))}

            {avalancheZone.map((pos, index) => (
              <MarkerF key={`av-point-${index}`} position={pos} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                fillColor: 'hsl(var(--destructive))',
                fillOpacity: 0.8,
                strokeWeight: 0
              }} />
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
             {heatmapDataGoogle.length > 0 && (
                <HeatmapLayerF
                    data={heatmapDataGoogle}
                    options={{
                        radius: 35,
                        opacity: 0.7,
                        gradient: [
                            "rgba(0, 255, 255, 0)",
                            "rgba(0, 255, 255, 1)",
                            "rgba(0, 191, 255, 1)",
                            "rgba(0, 127, 255, 1)",
                            "rgba(0, 63, 255, 1)",
                            "rgba(0, 0, 255, 1)",
                            "rgba(0, 0, 223, 1)",
                            "rgba(0, 0, 191, 1)",
                            "rgba(0, 0, 159, 1)",
                            "rgba(0, 0, 127, 1)",
                            "rgba(63, 0, 91, 1)",
                            "rgba(127, 0, 63, 1)",
                            "rgba(191, 0, 31, 1)",
                            "rgba(255, 0, 0, 1)"
                          ]
                    }}
                />
            )}

            {routes.map((route, index) => (
                <AnimatedTeam key={index} route={route} victimLocations={victimLocations} />
            ))}
        </GoogleMap>
    </div>
  );
};

export default MapWrapper;
