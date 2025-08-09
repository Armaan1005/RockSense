
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
  Users,
  User as UserIcon,
  Info,
  Thermometer,
  Wind,
  Search,
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
import type { PlacingMode, RescueRoute, Team, MapTypeId, RescueStrategy } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { TEAM_COLORS } from './ClientDashboard';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface RescueSidebarProps {
  placingMode: PlacingMode;
  setPlacingMode: (mode: PlacingMode) => void;
  weather: string;
  setWeather: (value: string) => void;
  timeElapsed: string;
  setTimeElapsed: (value: string) => void;
  mapTypeId: MapTypeId;
  setMapTypeId: (value: MapTypeId) => void;
  rescueStrategy: RescueStrategy;
  setRescueStrategy: (value: RescueStrategy) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  routes: RescueRoute[];
  teams: Team[];
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  victimCount: number;
  isBaseSet: boolean;
  isAvalancheZoneSet: boolean;
  analysisSummary: string | null;
}

const RescueSidebar: React.FC<RescueSidebarProps> = ({
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
  onGenerate,
  isGenerating,
  onAnalyze,
  isAnalyzing,
  routes,
  teams,
  onClear,
  onUndo,
  canUndo,
  victimCount,
  isBaseSet,
  isAvalancheZoneSet,
  analysisSummary,
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mission Control</h2>
            <Popover>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">How to use</span>
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Help</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              <PopoverContent className="text-sm">
                <h4 className="font-semibold mb-2">How to Generate Routes</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Set Base:</strong> Click "Set Rescue Base" and then click on the map to place your headquarters.
                  </li>
                  <li>
                    <strong>Add Victims:</strong> Click "Add Victim Location" and click on the map for each victim.
                  </li>
                  <li>
                    <strong>Define Zone (Optional):</strong> Click "Define Avalanche Zone" and click at least three points on the map to create a polygon.
                  </li>
                  <li>
                    <strong>Configure:</strong> Adjust weather, map type, and strategy.
                  </li>
                   <li>
                    <strong>Generate or Analyze:</strong> Click the desired action to see the AI plan.
                  </li>
                </ol>
              </PopoverContent>
            </Popover>
          </div>
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
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm font-medium" htmlFor="time-elapsed">Time Elapsed</label>
                <Select value={timeElapsed} onValueChange={setTimeElapsed}>
                  <SelectTrigger id="time-elapsed"><Clock className="mr-2"/>{timeElapsed}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Less than 1 hour">Less than 1 hour</SelectItem>
                    <SelectItem value="1-3 hours">1-3 hours</SelectItem>
                    <SelectItem value="3-6 hours">3-6 hours</SelectItem>
                    <SelectItem value="More than 6 hours">More than 6 hours</SelectItem>
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
             <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium" htmlFor="rescue-strategy">Rescue Strategy</label>
                <Select value={rescueStrategy} onValueChange={(v) => setRescueStrategy(v as RescueStrategy)}>
                  <SelectTrigger id="rescue-strategy">
                    {rescueStrategy === 'multi' ? <Users className="mr-2" /> : <UserIcon className="mr-2" />}
                    {rescueStrategy === 'multi' ? 'Multi Team' : 'Single Team'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multi">Multi Team</SelectItem>
                    <SelectItem value="single">Single Team (TSP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-md font-semibold mb-2">Rescue Plan</h3>

            {isGenerating && !isAnalyzing && <p className="text-sm text-muted-foreground">Generating plan...</p>}
            
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
          <Separator />
           <div>
            <h3 className="text-md font-semibold mb-2">Analysis Summary</h3>
            {isAnalyzing && <p className="text-sm text-muted-foreground">Analyzing...</p>}
            {analysisSummary && !isAnalyzing && (
                 <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{analysisSummary}</p>
                    </CardContent>
                </Card>
            )}
             {!analysisSummary && !isAnalyzing && (
                <p className="text-sm text-muted-foreground">No analysis performed yet.</p>
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
        <div className="flex gap-2">
            <Button onClick={onGenerate} disabled={isGenerating || isAnalyzing} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isGenerating ? <Loader className="mr-2 animate-spin"/> : <BrainCircuit className="mr-2"/>}
            Generate Routes
            </Button>
            <Button onClick={onAnalyze} disabled={isAnalyzing || isGenerating || !isAvalancheZoneSet || victimCount === 0} variant="outline" className="w-full">
                {isAnalyzing ? <Loader className="mr-2 animate-spin"/> : <Search className="mr-2"/>}
                Analyze
            </Button>
        </div>
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
