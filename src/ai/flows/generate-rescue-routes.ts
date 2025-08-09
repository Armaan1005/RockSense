'use server';

/**
 * @fileOverview A rescue route generation AI agent.
 *
 * - generateRescueRoutes - A function that handles the rescue route generation process.
 * - GenerateRescueRoutesInput - The input type for the generateRescueRoutes function.
 * - GenerateRescueRoutesOutput - The return type for the generateRescueRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRescueRoutesInputSchema = z.object({
  baseLocation: z
    .string()
    .describe("The rescue base's location, as a 'latitude,longitude' string."),
  victimLocations: z
    .array(z.string())
    .describe("A list of victim locations, each as a 'latitude,longitude' string."),
  weatherConditions: z
    .string()
    .describe('A description of the current weather conditions.'),
});
export type GenerateRescueRoutesInput = z.infer<typeof GenerateRescueRoutesInputSchema>;

const RescueRouteSchema = z.object({
  teamName: z.string().describe('The name of the rescue team assigned to this route.'),
  routeDescription: z.string().describe('A description of the route, including key landmarks and challenges.'),
  routeCoordinates: z.array(z.string()).describe('An array of coordinate strings (latitude, longitude) representing the path of the route.'),
  estimatedTimeArrival: z.string().describe('Estimated time of arrival at the victim location'),
  priority: z.string().describe('Priority of the route (High, Medium, Low)'),
});

const HeatmapDataPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  intensity: z.number(),
});
export type HeatmapDataPoint = z.infer<typeof HeatmapDataPointSchema>;


const GenerateRescueRoutesOutputSchema = z.object({
  routes: z.array(RescueRouteSchema).describe('An array of generated rescue routes.'),
  heatmapData: z.array(HeatmapDataPointSchema).describe('Heatmap data indicating probability of finding victims (reds = high risk, blues = low).'),
});

export type GenerateRescueRoutesOutput = z.infer<typeof GenerateRescueRoutesOutputSchema>;

export async function generateRescueRoutes(input: GenerateRescueRoutesInput): Promise<GenerateRescueRoutesOutput> {
  return generateRescueRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRescueRoutesPrompt',
  input: {schema: GenerateRescueRoutesInputSchema},
  output: {schema: GenerateRescueRoutesOutputSchema},
  prompt: `You are an expert in search and rescue route planning. Your task is to generate 2-3 optimal, non-overlapping rescue routes from a base location to multiple victim locations, considering the treacherous Himalayan terrain.

You must generate plausible, fictional route coordinates that simulate a realistic path. The path should not be a straight line. It should have multiple points to suggest a path that avoids obstacles.

Here's your process:
1. For each victim, create a plausible route from the rescue base.
2. Generate a series of 'latitude,longitude' coordinates for the 'routeCoordinates' field to represent this path. Create at least 5-10 points for each route.
3. Create a plausible 'routeDescription' based on potential terrain and weather conditions.
4. Assign a priority (High, Medium, Low) and an estimated time of arrival.
5. Generate heatmap data indicating the probability of finding victims (reds for high-risk, blues for low-risk).

Base Location: {{{baseLocation}}}
Victim Locations: {{#each victimLocations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Weather Conditions: {{{weatherConditions}}}

Routes should be labeled with team names like Team Alpha, Team Bravo, etc.
`,
});

const generateRescueRoutesFlow = ai.defineFlow(
  {
    name: 'generateRescueRoutesFlow',
    inputSchema: GenerateRescueRoutesInputSchema,
    outputSchema: GenerateRescueRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
