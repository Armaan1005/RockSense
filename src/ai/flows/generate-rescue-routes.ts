
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
  strategy: z.enum(['multi-team', 'single-team']).describe("The rescue strategy to use. 'multi-team' for multiple routes, 'single-team' for one optimized TSP route."),
});
export type GenerateRescueRoutesInput = z.infer<typeof GenerateRescueRoutesInputSchema>;

const RescueRouteSchema = z.object({
  teamName: z.string().describe('The name of the rescue team assigned to this route.'),
  routeDescription: z.string().describe('A description of the route, including key landmarks and challenges.'),
  routeCoordinates: z.array(z.string()).describe('An array of coordinate strings (latitude, longitude) representing the path of the route.'),
  travellingDuration: z.string().describe('Estimated travel duration for the route (e.g., "2 hours 30 minutes").'),
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
  prompt: `You are an expert in search and rescue route planning in treacherous Himalayan terrain. You will generate rescue routes based on the provided information and the chosen strategy.

You must generate plausible, fictional route coordinates that simulate a realistic path. The path should not be a straight line. It should have multiple points to suggest a path that avoids obstacles.

**Input:**
- Base Location: {{{baseLocation}}}
- Victim Locations: {{#each victimLocations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Weather Conditions: {{{weatherConditions}}}
- Strategy: {{{strategy}}}

**Instructions by Strategy:**

{{#if (eq strategy "multi-team")}}
**Strategy: Multi Team**
- Your task is to generate 2-3 optimal, non-overlapping rescue routes from the base location to the victim locations.
- For each victim, create a plausible route from the rescue base.
- Assign a priority (High, Medium, Low) and an estimated travelling duration for each route.
- Routes should be labeled with team names like Team Alpha, Team Bravo, etc.
{{/if}}

{{#if (eq strategy "single-team")}}
**Strategy: Single Team (Traveling Salesperson Problem)**
- Your task is to generate a *single*, optimized route for one team (Team Alpha).
- The route must start at the base location and visit *all* victim locations in the most efficient order possible to minimize travel time.
- The route should be continuous, going from one victim to the next in the optimized sequence.
- Generate a single, comprehensive 'routeDescription', 'travellingDuration', and set 'priority' to High.
{{/if}}

**Common Instructions for all Strategies:**
- Generate a series of 'latitude,longitude' coordinates for the 'routeCoordinates' field for each route. Create at least 5-10 points per leg of the journey (e.g., base to victim, or victim to victim).
- Create a plausible 'routeDescription' based on potential terrain and weather conditions.
- Generate heatmap data indicating the probability of finding victims (reds for high-risk, blues for low-risk).

**Output Format:**
You must provide your response in the following JSON format. Do not include any other text or explanations.

\`\`\`json
{
  "routes": [
    {
      "teamName": "Team Alpha",
      "routeDescription": "A detailed description of the route for Team Alpha...",
      "routeCoordinates": ["lat,lng", "lat,lng", "..."],
      "travellingDuration": "X hours Y minutes",
      "priority": "High"
    }
  ],
  "heatmapData": [
    { "latitude": 30.3, "longitude": 79.9, "intensity": 0.8 },
    { "latitude": 30.4, "longitude": 79.8, "intensity": 0.5 }
  ]
}
\`\`\`
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
    if (!output) {
      throw new Error("The AI model failed to return a valid response. Please try again.");
    }
    return output;
  }
);
