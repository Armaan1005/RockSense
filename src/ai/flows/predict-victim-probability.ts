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
  heatmapData: z
    .string()
    .describe(
      'A string containing data for the heatmap overlay, with reds representing high-risk zones and blues representing low-risk zones.'
    ),
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
  prompt: `You are an expert in avalanche rescue planning. Based on the provided information, you will generate a heatmap overlay indicating the probability of finding victims.

Weather Conditions: {{{weatherConditions}}}
Time Elapsed Since Avalanche: {{{timeElapsed}}}
Avalanche Zone Coordinates: {{{avalancheZoneCoordinates}}}
Victim Coordinates: {{{victimCoordinates}}}

Consider factors such as snow drift, terrain, and the "golden hour" to determine high-probability zones. Provide a summary of your analysis and the heatmap data.

Format heatmap data as a simple string.  Example: "(lat1,lon1,prob1),(lat2,lon2,prob2)"

Heatmap Data: 
Summary: `,
});

const predictVictimProbabilityFlow = ai.defineFlow(
  {
    name: 'predictVictimProbabilityFlow',
    inputSchema: PredictVictimProbabilityInputSchema,
    outputSchema: PredictVictimProbabilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
