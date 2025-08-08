'use client';

import * as React from 'react';
import {
  Flag,
  User,
  Triangle,
  CloudSnow,
  Clock,
  BrainCircuit,
  Loader,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { PlacingMode, RescueRoute, Team } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { TEAM_COLORS } from './ClientDashboard';
import GoldenHourTimer from './GoldenHourTimer';

interface RescueSidebarProps {
  placingMode: PlacingMode;
  setPlacingMode: (mode: PlacingMode) => void;
  weather: string;
  setWeather: (value: string) => void;
  timeOfDay: string;
  setTimeOfDay: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  routes: RescueRoute[];
  teams: Team[];
  onClear: () => void;
  victimCount: number;
  isBaseSet: boolean;
  isAvalancheZoneSet: boolean;
}

const RescueSidebar: React.FC<RescueSidebarProps> = ({
  placingMode,
  setPlacingMode,
  weather,
  setWeather,
  timeOfDay,
  setTimeOfDay,
  onGenerate,
  isGenerating,
  routes,
  teams,
  onClear,
  victimCount,
  isBaseSet,
  isAvalancheZoneSet,
}) => {
  return (
    <aside className="w-[380px] flex flex-col border-l bg-background/80 backdrop-blur-sm">
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
          <h3 className="text-md font-medium">Conditions</h3>
          <div className="grid grid-cols-2 gap-2">
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
              <label className="text-sm font-medium" htmlFor="time">Time of Day</label>
              <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger id="time"><Clock className="mr-2"/>{timeOfDay}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Dusk">Dusk</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 mt-auto border-t space-y-2">
         <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Base Set: <Badge variant={isBaseSet ? "default" : "secondary"}>{isBaseSet ? "Yes" : "No"}</Badge></span>
            <span>Victims: <Badge variant={victimCount > 0 ? "default" : "secondary"}>{victimCount}</Badge></span>
            <span>Zone Defined: <Badge variant={isAvalancheZoneSet ? "default" : "secondary"}>{isAvalancheZoneSet ? "Yes" : "No"}</Badge></span>
        </div>
        <Button onClick={onGenerate} disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isGenerating ? <Loader className="mr-2 animate-spin"/> : <BrainCircuit className="mr-2"/>}
          Generate Rescue Routes
        </Button>
        <Button onClick={onClear} variant="outline" className="w-full">
            <X className="mr-2"/> Clear All
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Golden Hour</CardTitle>
              <GoldenHourTimer isRunning={isGenerating || routes.length > 0} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Critical window for victim survival.</p>
            </CardContent>
          </Card>
          
          <h3 className="text-md font-semibold mt-4 mb-2">Rescue Plan</h3>
          {isGenerating && <p className="text-sm text-muted-foreground">Generating plan...</p>}
          
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
                  <AccordionContent className="space-y-2">
                    <p className="text-sm">{route.routeDescription}</p>
                    <p className="text-sm font-medium">ETA: <span className="font-mono">{route.estimatedTimeArrival}</span></p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default RescueSidebar;
