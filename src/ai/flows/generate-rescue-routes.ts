
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
  travellingDuration: z.string().describe('Estimated travel duration for the route (e.g., "2 hours 30 minutes").'),
  priority: z.string().describe('Priority of the route (High, Medium, Low)'),
});

const GenerateRescueRoutesOutputSchema = z.object({
  routes: z.array(RescueRouteSchema).describe('An array of generated rescue routes.'),
});

export type GenerateRescueRoutesOutput = z.infer<typeof GenerateRescueRoutesOutputSchema>;

export async function generateRescueRoutes(input: GenerateRescueRoutesInput): Promise<GenerateRescueRoutesOutput> {
  const result = await generateRescueRoutesFlow(input);
  // The heatmap is removed, so we need to adjust what we return.
  // For now, let's just return the routes and an empty heatmap array to satisfy the client.
  return { ...result, heatmapData: [] };
}

const prompt = ai.definePrompt({
  name: 'generateRescueRoutesPrompt',
  input: {schema: GenerateRescueRoutesInputSchema},
  output: {schema: GenerateRescueRoutesOutputSchema},
  prompt: `You are an expert in search and rescue route planning in treacherous Himalayan terrain. Your task is to generate a rescue plan based on the provided information.

**IMPORTANT: You must respond with only a valid JSON object that conforms to the output schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json. Your response must be the raw JSON object itself.**

You must generate plausible, fictional route coordinates that simulate a realistic path. The path should not be a straight line. It should have multiple points to suggest a path that avoids obstacles.

**Input:**
- Base Location: {{{baseLocation}}}
- Victim Locations: {{#each victimLocations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Weather Conditions: {{{weatherConditions}}}

**Instructions:**
- Your task is to generate 2-3 optimal, non-overlapping rescue routes from the base location to the victim locations.
- For each victim, create a plausible route from the rescue base.
- Assign a priority (High, Medium, Low) and an estimated travelling duration for each route.
- Routes should be labeled with team names like Team Alpha, Team Bravo, etc.
- Generate a series of 'latitude,longitude' coordinates for the 'routeCoordinates' field for each route. Create at least 5-10 points per leg of the journey (e.g., base to victim, or victim to victim).
- Create a plausible 'routeDescription' based on potential terrain and weather conditions.
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
