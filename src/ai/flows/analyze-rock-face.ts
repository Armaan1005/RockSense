'use server';

/**
 * @fileOverview Analyzes a rock face image for signs of instability.
 *
 * - analyzeRockFace - A function that handles the rock face analysis process.
 * - AnalyzeRockFaceInput - The input type for the analyzeRockFace function.
 * - AnalyzeRockFaceOutput - The return type for the analyzeRockFace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRockFaceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a rock face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeRockFaceInput = z.infer<typeof AnalyzeRockFaceInputSchema>;

const CrackAnalysisSchema = z.object({
    detected: z.boolean().describe("Whether any cracks or significant fissures were detected."),
    count: z.number().describe("The number of significant cracks or fissures identified."),
    description: z.string().describe("A brief description of the detected cracks, their location, and orientation."),
    severity: z.enum(['Low', 'Medium', 'High', 'None']).describe("The assessed severity of the detected cracks."),
});

const AnalyzeRockFaceOutputSchema = z.object({
  stabilityRating: z.enum(['Very Stable', 'Stable', 'Requires Monitoring', 'Potentially Unstable', 'Unstable']).describe("An overall stability rating for the rock face based on the visual analysis."),
  crackAnalysis: CrackAnalysisSchema,
  additionalObservations: z.string().describe("Any other relevant observations, such as signs of weathering, water seepage, or vegetation growth that could impact stability."),
});
export type AnalyzeRockFaceOutput = z.infer<typeof AnalyzeRockFaceOutputSchema>;

export async function analyzeRockFace(
  input: AnalyzeRockFaceInput
): Promise<AnalyzeRockFaceOutput> {
  return analyzeRockFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRockFacePrompt',
  input: {schema: AnalyzeRockFaceInputSchema},
  output: {schema: AnalyzeRockFaceOutputSchema},
  prompt: `You are an expert geotechnical engineer with a specialization in computer vision for rockfall detection. Analyze the provided image of a rock face.

**Image to Analyze:**
{{media url=photoDataUri}}

**Instructions:**
1.  **Analyze the image for discontinuities**: Look for cracks, fissures, joints, and any other signs of structural weakness.
2.  **Complete the 'crackAnalysis'**:
    - Set 'detected' to true if you find any cracks, false otherwise.
    - Provide a 'count' of the significant cracks.
    - Describe the location, orientation, and nature of the detected cracks.
    - Assess the 'severity' of the cracks based on their apparent width, length, and density. A dense network of wide cracks is 'High' severity.
3.  **Determine Overall 'stabilityRating'**: Based on the crack analysis and any other visual cues (e.g., weathering, water stains), provide an overall stability rating. 'Unstable' should be reserved for imminent failure risks.
4.  **Provide 'additionalObservations'**: Note any other visual features that could influence the rock face's stability.

**IMPORTANT: You must respond with only a valid JSON object that conforms to the output schema. Do not include any other text or markdown formatting.**
`,
});

const analyzeRockFaceFlow = ai.defineFlow(
  {
    name: 'analyzeRockFaceFlow',
    inputSchema: AnalyzeRockFaceInputSchema,
    outputSchema: AnalyzeRockFaceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid analysis. Please try a different image.");
    }
    return output;
  }
);
