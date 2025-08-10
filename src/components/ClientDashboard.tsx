
"use client";

import * as React from 'react';
import type { LatLngLiteral, PlacingMode, RescueRoute, Team, MapTypeId, RescueStrategy } from '@/types';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import RescueSidebar from '@/components/RescueSidebar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { getRescueRoutesAction, getVictimProbabilityAction } from '@/lib/actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>
});

export const TEAM_COLORS: { [key: string]: string } = {
  'Team Alpha': '#3498db', // Blue
  'Team Bravo': '#2ecc71', // Green
  'Team Charlie': '#f1c40f', // Yellow
  'Team Delta': '#e67e22', // Orange
  'Team Omega': '#9b59b6', // Purple for single team
};

type LastAction = 'base' | 'victim' | 'avalanche' | null;

const ClientDashboard: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

  const [placingMode, setPlacingMode] = React.useState<PlacingMode>(null);
  const [baseLocation, setBaseLocation] = React.useState<LatLngLiteral | null>(null);
  const [victimLocations, setVictimLocations] = React.useState<LatLngLiteral[]>([]);
  const [avalancheZone, setAvalancheZone] = React.useState<LatLngLiteral[]>([]);
  const [lastActionStack, setLastActionStack] = React.useState<LastAction[]>([]);

  const [weather, setWeather] = React.useState<string>('Light Snow');
  const [timeElapsed, setTimeElapsed] = React.useState<string>('< 1 hour');
  const [mapTypeId, setMapTypeId] = React.useState<MapTypeId>('terrain');
  const [rescueStrategy, setRescueStrategy] = React.useState<RescueStrategy>('multi');

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [routes, setRoutes] = React.useState<RescueRoute[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [analysisSummary, setAnalysisSummary] = React.useState<string | null>(null);

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
    if(isMobile) setMobileSheetOpen(false);

    try {
      const result = await getRescueRoutesAction({
        baseLocation: `${baseLocation.lat},${baseLocation.lng}`,
        victimLocations: victimLocations.map(v => `${v.lat},${v.lng}`),
        weatherConditions: weather,
        rescueStrategy: rescueStrategy,
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

  const handleAnalyzeProbabilities = async () => {
    if (avalancheZone.length < 3) {
      toast({ title: 'Missing Information', description: 'Please define an avalanche zone with at least 3 points.', variant: 'destructive' });
      return;
    }
     if (victimLocations.length === 0) {
      toast({ title: 'Missing Information', description: 'Please add at least one victim location for analysis.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSummary(null);
    if(isMobile) setMobileSheetOpen(false);


    try {
       const result = await getVictimProbabilityAction({
        weatherConditions: weather,
        timeElapsed: timeElapsed,
        avalancheZoneCoordinates: avalancheZone.map(p => `${p.lat},${p.lng}`).join(';'),
        victimCoordinates: victimLocations.map(v => `${v.lat},${v.lng}`).join(';'),
      });

      setAnalysisSummary(result.summary);
      toast({ title: 'Success', description: 'Victim probability analyzed.' });

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  }

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
    setLastActionStack([]);
    setAnalysisSummary(null);
  }
  
  const sidebarProps = {
      placingMode,
      setPlacingMode,
      weather,
      setWeather,
      timeElapsed,
      setTimeElapsed,
      mapTypeId,
      setMapTypeId,
      rescueStrategy,
      setRescueStrategy,
      onGenerate: handleGenerateRoutes,
      isGenerating,
      onAnalyze: handleAnalyzeProbabilities,
      isAnalyzing,
      routes,
      teams,
      onClear: clearAll,
      onUndo: handleUndo,
      canUndo: lastActionStack.length > 0,
      victimCount: victimLocations.length,
      isBaseSet: !!baseLocation,
      isAvalancheZoneSet: avalancheZone.length > 2,
      analysisSummary,
  };


  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground font-body">
      <Header isMobile={isMobile} onMenuClick={() => setMobileSheetOpen(true)} />
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex-1 relative h-full">
          <MapWrapper
            baseLocation={baseLocation}
            victimLocations={victimLocations}
            avalancheZone={avalancheZone}
            routes={routes}
            onMapClick={addMapPoint}
            placingMode={placingMode}
            mapTypeId={mapTypeId}
          />
        </div>

        {isMobile ? (
             <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>Mission Control</SheetTitle>
                        <SheetDescription>
                            Configure mission parameters and generate rescue plans.
                        </SheetDescription>
                    </SheetHeader>
                   <RescueSidebar {...sidebarProps} />
                </SheetContent>
            </Sheet>
        ) : (
           <div className="md:w-[380px] shrink-0 h-full flex flex-col">
             <RescueSidebar {...sidebarProps} />
           </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;

    