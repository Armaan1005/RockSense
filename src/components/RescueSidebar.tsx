
'use client';

import * as React from 'react';
import {
  Flag,
  User,
  Triangle,
  CloudSnow,
  BrainCircuit,
  Loader,
  X,
  Undo2,
  Milestone,
  Clock,
  Map,
  GitMerge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { PlacingMode, RescueRoute, Team, MapTypeId } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { TEAM_COLORS } from './ClientDashboard';

interface RescueSidebarProps {
  placingMode: PlacingMode;
  setPlacingMode: (mode: PlacingMode) => void;
  weather: string;
  setWeather: (value: string) => void;
  mapTypeId: MapTypeId;
  setMapTypeId: (value: MapTypeId) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  routes: RescueRoute[];
  teams: Team[];
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  victimCount: number;
  isBaseSet: boolean;
  isAvalancheZoneSet: boolean;
}

const RescueSidebar: React.FC<RescueSidebarProps> = ({
  placingMode,
  setPlacingMode,
  weather,
  setWeather,
  mapTypeId,
  setMapTypeId,
  onGenerate,
  isGenerating,
  routes,
  teams,
  onClear,
  onUndo,
  canUndo,
  victimCount,
  isBaseSet,
  isAvalancheZoneSet,
}) => {

  const calculateRouteDistance = (routeCoordinates: string[]): string => {
    if (!window.google || !window.google.maps.geometry || routeCoordinates.length < 2) {
      return 'N/A';
    }

    const routePoints = routeCoordinates.map(coord => {
      const [lat, lng] = coord.split(',').map(parseFloat);
      return new window.google.maps.LatLng(lat, lng);
    });

    const distanceInMeters = window.google.maps.geometry.spherical.computeLength(routePoints);
    const distanceInKm = distanceInMeters / 1000;
    
    return `${distanceInKm.toFixed(2)} km`;
  };


  return (
    <aside className="w-[380px] flex flex-col border-l bg-background/80 backdrop-blur-sm h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Mission Control</h2>
          <div className="grid grid-cols-1 gap-2">
            <Button variant={placingMode === 'base' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('base')}><Flag className="mr-2"/> Set Rescue Base</Button>
            <Button variant={placingMode === 'victim' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('victim')}><User className="mr-2"/> Add Victim Location</Button>
            <Button variant={placingMode === 'avalanche' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('avalanche')}><Triangle className="mr-2"/> Define Avalanche Zone</Button>
          </div>
          
          <p className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
              {placingMode ? `Click on the map to place the ${placingMode}. For victims, click multiple times. For the avalanche zone, click to add points and form a polygon.` : "Select an action above to start marking the map."}
          </p>

          <Separator/>

          <div className="space-y-2">
            <h3 className="text-md font-medium">Conditions & Strategy</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium" htmlFor="weather">Weather</label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger id="weather"><CloudSnow className="mr-2"/>{weather}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear">Clear</SelectItem>
                    <SelectItem value="Light Snow">Light Snow</SelectItem>
                    <SelectItem value="Heavy Snow">Heavy Snow</SelectItem>
                    <SelectItem value="Blizzard">Blizzard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="map-type">Map Type</label>
                <Select value={mapTypeId} onValueChange={(v) => setMapTypeId(v as MapTypeId)}>
                  <SelectTrigger id="map-type"><Map className="mr-2"/>{mapTypeId.charAt(0).toUpperCase() + mapTypeId.slice(1)}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-md font-semibold mb-2">Rescue Plan</h3>
            {isGenerating && <p className="text-sm text-muted-foreground">Generating plan...</p>}
            
            {routes.length === 0 && !isGenerating && <p className="text-sm text-muted-foreground">No plan generated yet.</p>}

            {routes.length > 0 && (
              <Accordion type="single" collapsible defaultValue="item-0">
                {routes.map((route, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: TEAM_COLORS[route.teamName] || '#fff'}}></span>
                        <span className="font-semibold">{route.teamName}</span>
                        <Badge variant={route.priority === 'High' ? 'destructive' : 'secondary'}>{route.priority} Priority</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm">{route.routeDescription}</p>
                      <div className='flex flex-col gap-2 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                            <Milestone className='w-4 h-4' />
                            <span>Distance:</span>
                            <span className='font-semibold text-foreground'>{calculateRouteDistance(route.routeCoordinates)}</span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                            <Clock className='w-4 h-4' />
                            <span>Travelling Duration:</span>
                            <span className='font-semibold text-foreground'>{route.travellingDuration}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 mt-auto border-t space-y-2 shrink-0">
         <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Base Set: <Badge variant={isBaseSet ? "default" : "secondary"}>{isBaseSet ? "Yes" : "No"}</Badge></span>
            <span>Victims: <Badge variant={victimCount > 0 ? "default" : "secondary"}>{victimCount}</Badge></span>
            <span>Zone Defined: <Badge variant={isAvalancheZoneSet ? "default" : "secondary"}>{isAvalancheZoneSet ? "Yes" : "No"}</Badge></span>
        </div>
        <Button onClick={onGenerate} disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isGenerating ? <Loader className="mr-2 animate-spin"/> : <BrainCircuit className="mr-2"/>}
          Generate Rescue Routes
        </Button>
        <div className="flex gap-2">
            <Button onClick={onUndo} variant="outline" className="w-full" disabled={!canUndo}>
                <Undo2 className="mr-2"/> Undo
            </Button>
            <Button onClick={onClear} variant="outline" className="w-full">
                <X className="mr-2"/> Clear All
            </Button>
        </div>
      </div>
    </aside>
  );
};

export default RescueSidebar;
