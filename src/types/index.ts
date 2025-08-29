import type { PredictRiskZonesOutput as GenkitPredictRiskZonesOutput } from "@/ai/flows/predict-risk-zones";
import type { AnalyzeRockFaceOutput as GenkitAnalyzeRockFaceOutput } from "@/ai/flows/analyze-rock-face";


export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

export type PredictRiskZonesOutput = GenkitPredictRiskZonesOutput;
export type AnalyzeRockFaceOutput = GenkitAnalyzeRockFaceOutput;

export type RiskZone = GenkitPredictRiskZonesOutput['riskZones'][0];

export type PlacingMode = 'base' | 'risk-point' | 'unstable-zone' | null;

export type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type SlopeMaterial = 'granite' | 'limestone' | 'sandstone' | 'shale';
