
'use server';

/**
 * @fileOverview Predicts rockfall risk zones based on geotechnical and environmental data.
 *
 * - predictRiskZones - A function that handles the risk prediction process.
 * - PredictRiskZonesInput - The input type for the predictRiskZones function.
 * - PredictRiskZonesOutput - The return type for the predictRiskZones function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GaxiosError } from 'gaxios';

const PredictRiskZonesInputSchema = z.object({
  slopeGeometry: z.string().describe('The geometry of the slope, including angle.'),
  slopeMaterial: z.string().describe('The primary material of the slope (e.g., granite, limestone).'),
  environmentalFactors: z.string().describe('Current environmental conditions like rainfall or seismic activity.'),
  unstableZone: z.array(z.string()).describe('An array of coordinate strings (latitude, longitude) defining the polygon of the main unstable zone.'),
  highRiskPoints: z.array(z.string()).describe('A list of specific high-risk points of interest.'),
});
export type PredictRiskZonesInput = z.infer<typeof PredictRiskZonesInputSchema>;

const RiskZoneSchema = z.object({
  zoneName: z.string().describe('A descriptive name for the risk zone (e.g., "North Wall Face", "Haul Road Section 3").'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The predicted risk level for this zone.'),
  analysis: z.string().describe('A brief analysis explaining the risk level, referencing input factors.'),
  recommendation: z.string().describe('A concrete, actionable recommendation to mitigate the risk (e.g., "Install rock bolts", "Close haul road temporarily", "Increase monitoring frequency").'),
  zoneCoordinates: z.array(z.string()).describe("An array of coordinate strings (latitude, longitude) defining the polygon of this specific risk zone."),
});

export const PredictRiskZonesOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the overall stability and key findings of the site.'),
  riskZones: z.array(RiskZoneSchema).describe('An array of identified risk zones with their analysis and recommendations.'),
});
export type PredictRiskZonesOutput = z.infer<typeof PredictRiskZonesOutputSchema>;

export async function predictRiskZones(
  input: PredictRiskZonesInput
): Promise<PredictRiskZonesOutput> {
  return predictRiskZonesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictRiskZonesPrompt',
  input: {schema: PredictRiskZonesInputSchema},
  output: {schema: PredictRiskZonesOutputSchema},
  prompt: `You are an expert geotechnical engineer specializing in open-pit mine stability and rockfall prediction. Your task is to analyze the provided data and generate a risk assessment.

**IMPORTANT: You must respond with only a valid JSON object that conforms to the output schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json. Your response must be the raw JSON object itself.**

**Input Data:**
- Slope Geometry: {{{slopeGeometry}}}
- Slope Material: {{{slopeMaterial}}}
- Environmental Factors: {{{environmentalFactors}}}
- Main Unstable Zone Coordinates: {{#each unstableZone}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Specific High-Risk Points: {{#each highRiskPoints}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Instructions:**
1.  **Generate a 'summary'**: Provide a high-level overview of the site's stability based on the inputs.
2.  **Generate 'riskZones'**: Create 1-3 distinct risk zones based on the provided "Unstable Zone" and "High-Risk Points".
    - For each zone, assign a 'zoneName'.
    - Determine a 'riskLevel' ('Low', 'Medium', 'High') based on a simulated Factor of Safety calculation. Consider how the combination of slope angle, material, and environmental factors would influence stability. For example:
        - A steep slope ('Angle: 60 degrees') + weak material ('shale') + 'Heavy Rainfall' should result in a 'High' risk.
        - A gentle slope ('Angle: 30 degrees') + strong material ('granite') + 'Clear' weather should result in a 'Low' risk.
    - Write a concise 'analysis' justifying the assigned risk level.
    - Provide a practical, actionable 'recommendation' for each zone.
    - **Crucially, for each zone, generate a 'zoneCoordinates' array.** This should be a polygon that plausibly encompasses some of the "High-Risk Points" or sections of the "Main Unstable Zone". The polygons should be distinct but can overlap. Each polygon must have at least 3 points. The coordinates should be in the same "latitude,longitude" format as the input.
`,
});

const predictRiskZonesFlow = ai.defineFlow(
  {
    name: 'predictRiskZonesFlow',
    inputSchema: PredictRiskZonesInputSchema,
    outputSchema: PredictRiskZonesOutputSchema,
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
