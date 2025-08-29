
'use server';

import { predictRiskZones, type PredictRiskZonesInput, type PredictRiskZonesOutput } from "@/ai/flows/predict-risk-zones";

export async function predictRiskZonesAction(input: PredictRiskZonesInput): Promise<PredictRiskZonesOutput> {
    try {
        const output = await predictRiskZones(input);
        return output;
    } catch (error) {
        console.error("Error in predictRiskZones:", error);
        throw new Error("Failed to predict risk zones. Please try again.");
    }
}
