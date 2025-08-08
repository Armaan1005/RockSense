import type { GenerateRescueRoutesOutput } from "@/ai/flows/generate-rescue-routes";

export type LatLngTuple = [number, number];

export type RescueRoute = GenerateRescueRoutesOutput['routes'][0];
export type HeatmapData = GenerateRescueRoutesOutput['heatmapData'];

export type Team = {
  name: string;
  color: string;
};

export type PlacingMode = 'base' | 'victim' | 'avalanche' | null;
