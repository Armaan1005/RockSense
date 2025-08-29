
'use server';

import { predictRiskZones, type PredictRiskZonesInput, type PredictRiskZonesOutput } from "@/ai/flows/predict-risk-zones";
import { analyzeRockFace, type AnalyzeRockFaceInput, type AnalyzeRockFaceOutput } from "@/ai/flows/analyze-rock-face";

export async function predictRiskZonesAction(input: PredictRiskZonesInput): Promise<PredictRiskZonesOutput> {
    try {
        const output = await predictRiskZones(input);
        return output;
    } catch (error) {
        console.error("Error in predictRiskZones:", error);
        throw new Error("Failed to predict risk zones. Please try again.");
    }
}


export async function analyzeRockFaceAction(input: AnalyzeRockFaceInput): Promise<AnalyzeRockFaceOutput> {
    try {
        const output = await analyzeRockFace(input);
        return output;
    } catch (error) {
        console.error("Error in analyzeRockFace:", error);
        throw new Error("Failed to analyze rock face. Please try a different image or try again.");
    }
}
