
'use server';
/**
 * @fileOverview Generates a CSV report from rockfall analysis data.
 *
 * - generateReportCsv - A function that handles the CSV generation process.
 * - GenerateReportCsvInput - The input type for the generateReportCsv function.
 * - GenerateReportCsvOutput - The return type for the generateReportCsv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {PredictRiskZonesOutputSchema} from './predict-risk-zones';

export const GenerateReportCsvInputSchema = PredictRiskZonesOutputSchema;
export type GenerateReportCsvInput = z.infer<typeof GenerateReportCsvInputSchema>;


export const GenerateReportCsvOutputSchema = z.object({
  csvData: z.string().describe('The full report data formatted as a CSV string.'),
});
export type GenerateReportCsvOutput = z.infer<typeof GenerateReportCsvOutputSchema>;


export async function generateReportCsv(
  input: GenerateReportCsvInput
): Promise<GenerateReportCsvOutput> {
  return generateReportCsvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportCsvPrompt',
  input: {schema: GenerateReportCsvInputSchema},
  output: {schema: GenerateReportCsvOutputSchema},
  prompt: `You are a data formatting expert. Your task is to convert the provided JSON risk analysis data into a valid CSV string.

**JSON Input:**
\`\`\`json
{{{json input}}}
\`\`\`

**Instructions:**
1.  Create a CSV string from the provided data.
2.  The CSV header should be: "Zone Name,Risk Level,Analysis,Recommendation,Zone Coordinates"
3.  Each risk zone should be a new row in the CSV.
4.  The "Zone Coordinates" field should be a single string, with each coordinate pair separated by a semicolon (;).
5.  The overall 'summary' from the JSON should be added as the last line of the CSV, but it should be prefixed with "Summary:," and contained within a single cell.

**Example CSV Output:**
\`\`\`csv
Zone Name,Risk Level,Analysis,Recommendation,Zone Coordinates
North Wall Face,High,"A steep slope...","Install rock bolts","lat1,lng1;lat2,lng2;lat3,lng3"
Haul Road Section 3,Medium,"Moderate slope...","Increase monitoring frequency","lat4,lng4;lat5,lng5;lat6,lng6"
"Summary:","The overall stability of the site is considered Requires Monitoring, with two key zones identified that require immediate attention."
\`\`\`

**IMPORTANT: You must respond with only a valid JSON object that conforms to the output schema. The 'csvData' field must contain the complete CSV string and nothing else.**
`,
});

const generateReportCsvFlow = ai.defineFlow(
  {
    name: 'generateReportCsvFlow',
    inputSchema: GenerateReportCsvInputSchema,
    outputSchema: GenerateReportCsvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return valid CSV data.");
    }
    return output;
  }
);
