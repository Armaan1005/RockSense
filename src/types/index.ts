
import type { PredictRiskZonesOutput as GenkitPredictRiskZonesOutput } from "@/ai/flows/predict-risk-zones";

export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

export type PredictRiskZonesOutput = GenkitPredictRiskZonesOutput;

export type RiskZone = GenkitPredictRiskZonesOutput['riskZones'][0];

export type PlacingMode = 'base' | 'risk-point' | 'unstable-zone' | null;

export type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type SlopeMaterial = 'granite' | 'limestone' | 'sandstone' | 'shale';
