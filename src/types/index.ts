
import type { GenerateRescueRoutesOutput as GenkitGenerateRescueRoutesOutput } from "@/ai/flows/generate-rescue-routes";

export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

export type GenerateRescueRoutesOutput = GenkitGenerateRescueRoutesOutput;

export type RescueRoute = GenkitGenerateRescueRoutesOutput['routes'][0];

export type Team = {
  name: string;
  color: string;
};

export type PlacingMode = 'base' | 'victim' | 'avalanche' | null;

export type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type RescueStrategy = 'multi' | 'single';
