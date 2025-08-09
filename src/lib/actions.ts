
'use server';

import { generateRescueRoutes, type GenerateRescueRoutesInput, type GenerateRescueRoutesOutput } from "@/ai/flows/generate-rescue-routes";
import { predictVictimProbability, type PredictVictimProbabilityInput, type PredictVictimProbabilityOutput } from "@/ai/flows/predict-victim-probability";

export async function getRescueRoutesAction(input: GenerateRescueRoutesInput): Promise<GenerateRescueRoutesOutput> {
    try {
        const output = await generateRescueRoutes(input);
        return output;
    } catch (error) {
        console.error("Error in generateRescueRoutes:", error);
        throw new Error("Failed to generate rescue routes. Please try again.");
    }
}

export async function getVictimProbabilityAction(input: PredictVictimProbabilityInput): Promise<PredictVictimProbabilityOutput> {
    try {
        const output = await predictVictimProbability(input);
        return output;
    } catch (error) {
        console.error("Error in predictVictimProbability:", error);
        throw new Error("Failed to analyze victim probability. Please try again.");
    }
}
