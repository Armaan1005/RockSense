import type { AnalyzeRockFaceOutput as GenkitAnalyzeRockFaceOutput } from "@/ai/flows/analyze-rock-face";
import type { GenerateReportCsvInput as GenkitGenerateReportCsvInput, GenerateReportCsvOutput as GenkitGenerateReportCsvOutput } from "@/ai/flows/generate-report-csv";
import { z } from 'genkit';


export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];


export const RiskZoneSchema = z.object({
  zoneName: z.string().describe('A descriptive name for the risk zone (e.g., "North Wall Face", "Haul Road Section 3").'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The predicted risk level for this zone.'),
  analysis: z.string().describe('A brief analysis explaining the risk level, referencing input factors.'),
  recommendation: z.string().describe('A concrete, actionable recommendation to mitigate the risk (e.g., "Install rock bolts", "Close haul road temporarily", "Increase monitoring frequency").'),
  zoneCoordinates: z.array(z.string()).describe("An array of coordinate strings (latitude, longitude) defining the polygon of this specific risk zone."),
});

export const PredictRiskZonesOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the overall stability and key findings of the site.'),
  riskZones: z.array(RiskZoneSchema).describe('An array of identified risk zones with their analysis and recommendations.'),
});


export type PredictRiskZonesOutput = z.infer<typeof PredictRiskZonesOutputSchema>;
export type AnalyzeRockFaceOutput = GenkitAnalyzeRockFaceOutput;
export type GenerateReportCsvInput = GenkitGenerateReportCsvInput;
export type GenerateReportCsvOutput = GenkitGenerateReportCsvOutput;


export type RiskZone = z.infer<typeof RiskZoneSchema>;

export interface RiskZonePolygon extends RiskZone {
    zoneCoordinates: string[];
}


export type PlacingMode = 'base' | 'risk-point' | 'unstable-zone' | null;

export type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type SlopeMaterial = 'granite' | 'limestone' | 'sandstone' | 'shale';

export interface DatasetRow {
    row_idx: number;
    row?: {
        features: {
            feature_idx: number;
            name: string;
            value: any;
        }[];
    };
    truncated_cells: any[];
}

export type ChartData = {
  month: string;
  riskScore: number;
};
