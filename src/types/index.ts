
import type { GenerateRescueRoutesOutput, HeatmapDataPoint as GenkitHeatmapDataPoint } from "@/ai/flows/generate-rescue-routes";

export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

export type RescueRoute = GenerateRescueRoutesOutput['routes'][0];
export type HeatmapDataPoint = GenkitHeatmapDataPoint;

export type Team = {
  name: string;
  color: string;
};

export type PlacingMode = 'base' | 'victim' | 'avalanche' | null;
