
'use server';

/**
 * @fileOverview Predicts the probability of finding victims based on weather and time.
 *
 * - predictVictimProbability - A function that predicts victim probability.
 * - PredictVictimProbabilityInput - The input type for the predictVictimProbability function.
 * - PredictVictimProbabilityOutput - The return type for the predictVictimProbability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GaxiosError } from 'gaxios';

const PredictVictimProbabilityInputSchema = z.object({
  weatherConditions: z.string().describe('The current weather conditions.'),
  timeElapsed: z.string().describe('The time elapsed since the avalanche.'),
  avalancheZoneCoordinates: z.string().describe('The coordinates of the avalanche zone.'),
  victimCoordinates: z.string().describe('The last known coordinates of the victim(s).'),
});
export type PredictVictimProbabilityInput = z.infer<
  typeof PredictVictimProbabilityInputSchema
>;

const PredictVictimProbabilityOutputSchema = z.object({
  summary: z.string().describe('A summary of the probability analysis.'),
});
export type PredictVictimProbabilityOutput = z.infer<
  typeof PredictVictimProbabilityOutputSchema
>;

export async function predictVictimProbability(
  input: PredictVictimProbabilityInput
): Promise<PredictVictimProbabilityOutput> {
  return predictVictimProbabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictVictimProbabilityPrompt',
  input: {schema: PredictVictimProbabilityInputSchema},
  output: {schema: PredictVictimProbabilityOutputSchema},
  prompt: `You are an expert in avalanche rescue planning. Based on the provided information, you will generate a textual analysis about the probability of finding victims.

Weather Conditions: {{{weatherConditions}}}
Time Elapsed Since Avalanche: {{{timeElapsed}}}
Avalanche Zone Coordinates: {{{avalancheZoneCoordinates}}}
Victim Coordinates: {{{victimCoordinates}}}

Consider factors such as snow drift, terrain, and the "golden hour" to determine high-probability zones. Provide a concise, actionable summary of your analysis. Do not mention heatmaps.
`,
});

const predictVictimProbabilityFlow = ai.defineFlow(
  {
    name: 'predictVictimProbabilityFlow',
    inputSchema: PredictVictimProbabilityInputSchema,
    outputSchema: PredictVictimProbabilityOutputSchema,
  },
  async input => {
     try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error("The AI model failed to return a valid response. Please try again.");
      }
      return output;
    } catch (e) {
      if (e instanceof GaxiosError) {
        console.error(JSON.stringify(e.response?.data, null, 2));
      }
      throw e;
    }
  }
);
