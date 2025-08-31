
import type { AnalyzeRockFaceOutput as GenkitAnalyzeRockFaceOutput } from "@/ai/flows/analyze-rock-face";
import { z } from 'genkit';


export type LatLngLiteral = google.maps.LatLngLiteral;
export type LatLngTuple = [number, number];

export const PredictRiskZonesInputSchema = z.object({
  slopeGeometry: z.string().describe('The geometry of the slope, including angle.'),
  slopeMaterial: z.string().describe('The primary material of the slope (e.g., granite, limestone).'),
  environmentalFactors: z.string().describe('Current environmental conditions like rainfall or seismic activity.'),
  unstableZone: z.array(z.string()).describe('An array of coordinate strings (latitude, longitude) defining the polygon of the main unstable zone.'),
  highRiskPoints: z.array(z.string()).describe('A list of specific high-risk points of interest.'),
  displacement: z.string().optional().describe('Optional: Sensor data for ground displacement in millimeters.'),
  strain: z.string().optional().describe('Optional: Sensor data for ground strain in microstrains (με).'),
  porePressure: z.string().optional().describe('Optional: Sensor data for pore water pressure in kilopascals (kPa).'),
});

export const RiskZoneSchema = z.object({
  zoneName: z.string().describe('A descriptive name for the risk zone (e.g., "North Wall Face", "Haul Road Section 3").'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The predicted risk level for this zone.'),
  probability: z.number().min(0).max(100).describe('The estimated probability of a rockfall event occurring in this zone, as a percentage (0-100). High risk should be >70%, Medium 40-70%, Low <40%.'),
  analysis: z.string().describe('A brief analysis explaining the risk level, referencing input factors.'),
  recommendation: z.string().describe('A concrete, actionable recommendation to mitigate the risk (e.g., "Install rock bolts", "Close haul road temporarily", "Increase monitoring frequency").'),
  zoneCoordinates: z.array(z.string()).describe("An array of coordinate strings (latitude, longitude) defining the polygon of this specific risk zone."),
});

export const PredictRiskZonesOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the overall stability and key findings of the site.'),
  riskZones: z.array(RiskZoneSchema).describe('An array of identified risk zones with their analysis and recommendations.'),
});

export const GenerateReportCsvInputSchema = PredictRiskZonesOutputSchema;
export type GenerateReportCsvInput = z.infer<typeof GenerateReportCsvInputSchema>;

export const GenerateReportCsvOutputSchema = z.object({
  csvData: z.string().describe('The full report data formatted as a CSV string.'),
});
export type GenerateReportCsvOutput = z.infer<typeof GenerateReportCsvOutputSchema>;


export type PredictRiskZonesOutput = z.infer<typeof PredictRiskZonesOutputSchema>;
export type AnalyzeRockFaceOutput = GenkitAnalyzeRockFaceOutput;


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
