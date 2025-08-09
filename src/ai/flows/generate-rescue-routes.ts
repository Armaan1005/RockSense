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
  prompt: `You are an expert in search and rescue route planning, especially in avalanche scenarios, acting like a sophisticated routing service like Google Maps.

Given the location of a rescue base, victim locations, and weather conditions, generate 2-3 optimal search and rescue routes.

Think step-by-step to create the most plausible routes:
1.  Analyze the terrain between the base and each victim. Imagine ridges, valleys, and forests.
2.  Factor in the weather conditions provided. Heavy snow or blizzard conditions should result in less direct, more sheltered routes.
3.  Create a path that logically follows terrain features. The route should not be a straight line but a series of connected points that a real team could follow on the ground.
4.  Ensure the routes are non-overlapping to maximize search efficiency.

Base Location: {{{baseLocation}}}
Victim Locations: {{#each victimLocations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Weather Conditions: {{{weatherConditions}}}

Output an array of routes, a team name, a detailed route description, an array of coordinate strings representing the calculated path, the estimated time of arrival, and a priority (High, Medium, Low) for each route.
Also, generate heatmap data indicating probability of finding victims, with reds for high-risk zones and blues for low-risk zones. The heatmap data should consist of an array of latitude, longitude, and intensity objects.

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
