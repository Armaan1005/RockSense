
import type { GenerateRescueRoutesOutput as GenkitGenerateRescueRoutesOutput } from "@/ai/flows/generate-rescue-routes";

export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

// We create a new type that includes the heatmapData for now to avoid breaking the client
export type GenerateRescueRoutesOutput = GenkitGenerateRescueRoutesOutput & {
    heatmapData: HeatmapDataPoint[];
}

export type RescueRoute = GenkitGenerateRescueRoutesOutput['routes'][0];

export type HeatmapDataPoint = {
  latitude: number;
  longitude: number;
  intensity: number;
};

export type Team = {
  name: string;
  color: string;
};

export type PlacingMode = 'base' | 'victim' | 'avalanche' | null;

export type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type RescueStrategy = 'multi-team' | 'single-team';
