
"use client";

import * as React from 'react';
import { GoogleMap, useLoadScript, MarkerF, PolygonF } from '@react-google-maps/api';
import type { LatLngLiteral, PlacingMode, MapTypeId, RiskZone } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { RISK_COLORS } from '../ClientDashboard';

const MAP_ID = "rocksense_map_id";

const containerStyle = {
  width: '100%',
  height: '100%',
};

// A sample open-pit mine location
const center = {
  lat: 40.4015,
  lng: -112.1486
};

const libraries: ('marker' | 'places' | 'visualization' | 'geometry')[] = ['marker', 'places', 'visualization', 'geometry'];

interface MapWrapperProps {
  baseLocation: LatLngLiteral | null;
  highRiskPoints: LatLngLiteral[];
  unstableZoneShape: LatLngLiteral[];
  riskZones: RiskZone[];
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  placingMode: PlacingMode;
  mapTypeId: MapTypeId;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  baseLocation,
  highRiskPoints,
  unstableZoneShape,
  riskZones,
  onMapClick,
  placingMode,
  mapTypeId,
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
  
  const mapOptions: google.maps.MapOptions = {
    mapId: MAP_ID,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'cooperative',
    mapTypeId: mapTypeId,
    tilt: 45
  };
  
  const baseIcon = {
    path: "M12 3L1 9l11 6 9-4.5V9h2V8l-2.7-1.35L12 3zm0 13.5l-11-6v4.5l11 6 11-6v-4.5l-11 6z", // Material Design Layers icon
    fillColor: 'hsl(142.1 76.2% 36.3%)',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: 'white',
    scale: 1.2,
    anchor: new window.google.maps.Point(12, 12)
  };

  const riskPointIcon = {
    path: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z", // Material Design Error Outline
    fillColor: 'hsl(var(--destructive))',
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: 'white',
    scale: 1,
    anchor: new window.google.maps.Point(12, 12)
  };

  const unstablePointIcon = {
    path: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z", // Warning icon
    scale: 0.8,
    fillColor: 'orange',
    fillOpacity: 0.8,
    strokeWeight: 1,
    strokeColor: 'white',
    anchor: new window.google.maps.Point(12, 12)
  }

  // Find the risk zone that contains the unstable zone shape to color it
  const mainRiskZone = riskZones.length > 0 ? riskZones[0] : null;
  const riskColor = mainRiskZone ? RISK_COLORS[mainRiskZone.riskLevel] || 'hsl(var(--primary))' : 'hsl(var(--primary))';


  return (
    <div className='h-full w-full p-4 relative'>
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
            onClick={onMapClick}
            mapContainerClassName='rounded-md'
        >
            {/* Markers, Polygons, etc. */}
            {baseLocation && (
                <MarkerF position={baseLocation} title="Monitoring Base" icon={baseIcon} />
            )}

            {highRiskPoints.map((pos, index) => (
                <MarkerF key={index} position={pos} title={`High-Risk Point #${index + 1}`} icon={riskPointIcon} label={{ text: `${index + 1}`, color: 'white', fontSize: '10px', fontWeight: 'bold' }} />
            ))}

            {unstableZoneShape.map((pos, index) => (
              <MarkerF key={`av-point-${index}`} position={pos} icon={unstablePointIcon} />
            ))}
            
            {unstableZoneShape.length > 2 && (
                <PolygonF
                    paths={unstableZoneShape}
                    options={{
                        strokeColor: riskColor,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: riskColor,
                        fillOpacity: 0.35
                    }}
                />
            )}

        </GoogleMap>
    </div>
  );
};

export default MapWrapper;
