
"use client";

import * as React from 'react';
import type { LatLngLiteral, PlacingMode, RescueRoute, Team, HeatmapDataPoint, MapTypeId, RescueStrategy } from '@/types';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import RescueSidebar from '@/components/RescueSidebar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { getRescueRoutesAction } from '@/lib/actions';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>
});

export const TEAM_COLORS: { [key: string]: string } = {
  'Team Alpha': '#3498db', // Blue
  'Team Bravo': '#2ecc71', // Green
  'Team Charlie': '#f1c40f', // Yellow
  'Team Delta': '#e67e22', // Orange
};

type LastAction = 'base' | 'victim' | 'avalanche' | null;

const ClientDashboard: React.FC = () => {
  const { toast } = useToast();

  const [placingMode, setPlacingMode] = React.useState<PlacingMode>(null);
  const [baseLocation, setBaseLocation] = React.useState<LatLngLiteral | null>(null);
  const [victimLocations, setVictimLocations] = React.useState<LatLngLiteral[]>([]);
  const [avalancheZone, setAvalancheZone] = React.useState<LatLngLiteral[]>([]);
  const [lastActionStack, setLastActionStack] = React.useState<LastAction[]>([]);

  const [weather, setWeather] = React.useState<string>('Light Snow');
  const [mapTypeId, setMapTypeId] = React.useState<MapTypeId>('terrain');
  const [strategy, setStrategy] = React.useState<RescueStrategy>('multi-team');

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [routes, setRoutes] = React.useState<RescueRoute[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [heatmapData, setHeatmapData] = React.useState<HeatmapDataPoint[]>([]);

  const addMapPoint = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPoint = e.latLng.toJSON();
    if (placingMode === 'base') {
      setBaseLocation(newPoint);
      setPlacingMode(null);
      setLastActionStack(prev => [...prev, 'base']);
    } else if (placingMode === 'victim') {
      setVictimLocations(prev => [...prev, newPoint]);
      setLastActionStack(prev => [...prev, 'victim']);
    } else if (placingMode === 'avalanche') {
      setAvalancheZone(prev => [...prev, newPoint]);
      setLastActionStack(prev => [...prev, 'avalanche']);
    }
  };
  
  const handleGenerateRoutes = async () => {
    if (!baseLocation) {
      toast({ title: 'Missing Information', description: 'Please set a rescue base location.', variant: 'destructive' });
      return;
    }
    if (victimLocations.length === 0) {
      toast({ title: 'Missing Information', description: 'Please add at least one victim location.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setRoutes([]);
    setTeams([]);
    setHeatmapData([]);

    try {
      const result = await getRescueRoutesAction({
        baseLocation: `${baseLocation.lat},${baseLocation.lng}`,
        victimLocations: victimLocations.map(v => `${v.lat},${v.lng}`),
        weatherConditions: weather,
        strategy: strategy,
      });

      setRoutes(result.routes);
      setHeatmapData(result.heatmapData);
      
      const newTeams = result.routes.map(route => ({
        name: route.teamName,
        color: TEAM_COLORS[route.teamName] || '#ffffff'
      }));
      setTeams(newTeams);

      toast({ title: 'Success', description: 'Rescue routes generated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUndo = () => {
    if (lastActionStack.length === 0) return;

    const lastAction = lastActionStack[lastActionStack.length - 1];

    if (lastAction === 'base') {
      setBaseLocation(null);
    } else if (lastAction === 'victim') {
      setVictimLocations(prev => prev.slice(0, -1));
    } else if (lastAction === 'avalanche') {
      setAvalancheZone(prev => prev.slice(0, -1));
    }

    setLastActionStack(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    setBaseLocation(null);
    setVictimLocations([]);
    setAvalancheZone([]);
    setRoutes([]);
    setPlacingMode(null);
    setTeams([]);
    setHeatmapData([]);
    setLastActionStack([]);
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground font-body">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative h-full">
          <MapWrapper
            baseLocation={baseLocation}
            victimLocations={victimLocations}
            avalancheZone={avalancheZone}
            routes={routes}
            onMapClick={addMapPoint}
            placingMode={placingMode}
            heatmapData={heatmapData}
            mapTypeId={mapTypeId}
          />
        </div>
        <RescueSidebar
          placingMode={placingMode}
          setPlacingMode={setPlacingMode}
          weather={weather}
          setWeather={setWeather}
          mapTypeId={mapTypeId}
          setMapTypeId={setMapTypeId}
          strategy={strategy}
          setStrategy={setStrategy}
          onGenerate={handleGenerateRoutes}
          isGenerating={isGenerating}
          routes={routes}
          teams={teams}
          onClear={clearAll}
          onUndo={handleUndo}
          canUndo={lastActionStack.length > 0}
          victimCount={victimLocations.length}
          isBaseSet={!!baseLocation}
          isAvalancheZoneSet={avalancheZone.length > 2}
        />
      </main>
    </div>
  );
};

export default ClientDashboard;
