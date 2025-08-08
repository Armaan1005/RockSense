'use server';

import { generateRescueRoutes, type GenerateRescueRoutesInput, type GenerateRescueRoutesOutput } from "@/ai/flows/generate-rescue-routes";

export async function getRescueRoutesAction(input: GenerateRescueRoutesInput): Promise<GenerateRescueRoutesOutput> {
    try {
        const output = await generateRescueRoutes(input);
        return output;
    } catch (error) {
        console.error("Error in generateRescueRoutes:", error);
        throw new Error("Failed to generate rescue routes. Please try again.");
    }
}
