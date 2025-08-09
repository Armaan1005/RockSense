
'use client';

import * as React from 'react';
import L from 'leaflet';
import { Marker, useMap } from 'react-leaflet';
import type { LatLngTuple, RescueRoute } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { rescueTeamIcon } from './CustomIcons';

interface AnimatedTeamProps {
  route: RescueRoute;
  victimLocations: LatLngTuple[];
}

const AnimatedTeam: React.FC<AnimatedTeamProps> = ({ route, victimLocations }) => {
  const map = useMap();
  const { toast } = useToast();
  const [position, setPosition] = React.useState<LatLngTuple | null>(null);
  
  const routePoints = React.useMemo(() => route.routeCoordinates.map(coord => {
    const [lat, lng] = coord.split(',').map(parseFloat);
    return [lat, lng] as LatLngTuple;
  }), [route.routeCoordinates]);

  const totalDuration = 15000; // 15 seconds for the entire route animation

  React.useEffect(() => {
    if (routePoints.length < 2) return;

    let pos = routePoints[0];
    setPosition(pos);
    const polyline = L.polyline(routePoints);
    const totalDistance = routePoints.reduce((acc, point, i) => {
        if (i === 0) return 0;
        return acc + L.latLng(routePoints[i-1]).distanceTo(L.latLng(point));
    }, 0);
    
    let startTime: number | null = null;
    let animationFrameId: number;
    let reachedVictims = new Set<number>();

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / totalDuration, 1);
      
      const currentDistance = totalDistance * progress;
      
      let traveledDistance = 0;
      for (let i = 0; i < routePoints.length - 1; i++) {
        const start = L.latLng(routePoints[i]);
        const end = L.latLng(routePoints[i+1]);
        const segmentDistance = start.distanceTo(end);

        if (traveledDistance + segmentDistance >= currentDistance) {
            const ratio = (currentDistance - traveledDistance) / segmentDistance;
            const lat = start.lat + (end.lat - start.lat) * ratio;
            const lng = start.lng + (end.lng - start.lng) * ratio;
            pos = [lat, lng];
            setPosition(pos);
            break;
        }
        traveledDistance += segmentDistance;
      }
      
      const currentPos = pos;
      if (currentPos) {
        const currentLatLng = L.latLng(currentPos);
        victimLocations.forEach((victim, index) => {
            if (reachedVictims.has(index)) return;
            const victimLatLng = L.latLng(victim);
            if (currentLatLng.distanceTo(victimLatLng) < 100) { // 100 meters threshold
                reachedVictims.add(index);
                toast({
                    title: "Victim Reached",
                    description: `${route.teamName} has reached Victim #${index + 1}.`,
                });
            }
        });
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setPosition(routePoints[routePoints.length - 1]);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [routePoints, map, toast, route.teamName, victimLocations]);

  if (!position) return null;

  return <Marker position={position} icon={rescueTeamIcon} />;
};

export default AnimatedTeam;
