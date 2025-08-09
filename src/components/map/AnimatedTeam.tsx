
"use client";

import * as React from 'react';
import { MarkerF, useGoogleMap } from '@react-google-maps/api';
import type { LatLngLiteral, RescueRoute } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AnimatedTeamProps {
  route: RescueRoute;
  victimLocations: LatLngLiteral[];
}

const AnimatedTeam: React.FC<AnimatedTeamProps> = ({ route, victimLocations }) => {
  const { toast } = useToast();
  const [position, setPosition] = React.useState<LatLngLiteral | null>(null);
  const map = useGoogleMap();

  const routePoints = React.useMemo(() => route.routeCoordinates.map(coord => {
    const [lat, lng] = coord.split(',').map(parseFloat);
    return { lat, lng };
  }), [route.routeCoordinates]);

  const totalDuration = 15000; // 15 seconds for the entire route animation

  React.useEffect(() => {
    if (routePoints.length < 2 || !map || !window.google || !window.google.maps.geometry) return;
    
    let pos = routePoints[0];
    setPosition(pos);

    const totalDistance = routePoints.reduce((acc, point, i) => {
        if (i === 0) return 0;
        const prevPoint = new google.maps.LatLng(routePoints[i-1].lat, routePoints[i-1].lng);
        const currentPoint = new google.maps.LatLng(point.lat, point.lng);
        return acc + google.maps.geometry.spherical.computeDistanceBetween(prevPoint, currentPoint);
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
        const start = new google.maps.LatLng(routePoints[i]);
        const end = new google.maps.LatLng(routePoints[i+1]);
        const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(start, end);

        if (traveledDistance + segmentDistance >= currentDistance) {
            const ratio = (currentDistance - traveledDistance) / segmentDistance;
            const newPos = google.maps.geometry.spherical.interpolate(start, end, ratio);
            if (newPos) {
              pos = { lat: newPos.lat(), lng: newPos.lng() };
              setPosition(pos);
            }
            break;
        }
        traveledDistance += segmentDistance;
      }
      
      const currentPos = pos;
      if (currentPos) {
        const currentLatLng = new google.maps.LatLng(currentPos);
        victimLocations.forEach((victim, index) => {
            if (reachedVictims.has(index)) return;
            const victimLatLng = new google.maps.LatLng(victim);
            if (google.maps.geometry.spherical.computeDistanceBetween(currentLatLng, victimLatLng) < 100) { // 100 meters threshold
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
        const finalPosition = routePoints[routePoints.length - 1];
        setPosition(finalPosition);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [routePoints, toast, route.teamName, victimLocations, map]);

  if (!position || !window.google) return null;

  const teamIcon = {
    path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", // Material Design User icon
    fillColor: 'hsl(var(--primary))',
    fillOpacity: 1,
    strokeColor: 'white',
    strokeWeight: 1.5,
    scale: 1,
    anchor: new window.google.maps.Point(12, 12)
  };

  return <MarkerF position={position} icon={teamIcon} zIndex={100} />;
};

export default AnimatedTeam;
