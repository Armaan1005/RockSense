
"use client";

import * as React from 'react';
import type { LatLngTuple, PlacingMode, RescueRoute, Team } from '@/types';
import { getRescueRoutesAction } from '@/lib/actions';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import RescueSidebar from '@/components/RescueSidebar';
import Snowfall from '@/components/Snowfall';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

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

const ClientDashboard: React.FC = () => {
  const { toast } = useToast();

  const [placingMode, setPlacingMode] = React.useState<PlacingMode>(null);
  const [baseLocation, setBaseLocation] = React.useState<LatLngTuple | null>(null);
  const [victimLocations, setVictimLocations] = React.useState<LatLngTuple[]>([]);
  const [avalancheZone, setAvalancheZone] = React.useState<LatLngTuple[]>([]);

  const [weather, setWeather] = React.useState<string>('Light Snow');
  const [timeOfDay, setTimeOfDay] = React.useState<string>('Afternoon');

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [routes, setRoutes] = React.useState<RescueRoute[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);

  const addMapPoint = (latlng: { lat: number; lng: number }) => {
    const newPoint: LatLngTuple = [latlng.lat, latlng.lng];
    if (placingMode === 'base') {
      setBaseLocation(newPoint);
      setPlacingMode(null);
    } else if (placingMode === 'victim') {
      setVictimLocations(prev => [...prev, newPoint]);
    } else if (placingMode === 'avalanche') {
      setAvalancheZone(prev => [...prev, newPoint]);
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

    try {
      const result = await getRescueRoutesAction({
        baseLocation: `${baseLocation[0]},${baseLocation[1]}`,
        victimLocations: victimLocations.map(v => `${v[0]},${v[1]}`),
        weatherConditions: weather,
        timeOfDay: timeOfDay,
      });

      setRoutes(result.routes);
      
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

  const clearAll = () => {
    setBaseLocation(null);
    setVictimLocations([]);
    setAvalancheZone([]);
    setRoutes([]);
    setPlacingMode(null);
    setTeams([]);
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground font-body">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative h-full">
          <Snowfall />
          <MapWrapper
            baseLocation={baseLocation}
            victimLocations={victimLocations}
            avalancheZone={avalancheZone}
            routes={routes}
            onMapClick={addMapPoint}
            teams={teams}
            placingMode={placingMode}
          />
        </div>
        <RescueSidebar
          placingMode={placingMode}
          setPlacingMode={setPlacingMode}
          weather={weather}
          setWeather={setWeather}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          onGenerate={handleGenerateRoutes}
          isGenerating={isGenerating}
          routes={routes}
          teams={teams}
          onClear={clearAll}
          victimCount={victimLocations.length}
          isBaseSet={!!baseLocation}
          isAvalancheZoneSet={avalancheZone.length > 2}
        />
      </main>
    </div>
  );
};

export default ClientDashboard;
