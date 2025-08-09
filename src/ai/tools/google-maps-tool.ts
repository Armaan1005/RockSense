
'use server';
/**
 * @fileOverview A tool for fetching directions from the Google Maps API.
 * - getDirectionsTool - The Genkit tool definition.
 */
import { getDirections } from '@/services/google-maps';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getDirectionsTool = ai.defineTool(
  {
    name: 'getDirections',
    description: 'Fetches driving directions from an origin to a destination using Google Maps API.',
    inputSchema: z.object({
      origin: z.string().describe("The starting point for the directions, as a 'latitude,longitude' string."),
      destination: z.string().describe("The ending point for the directions, as a 'latitude,longitude' string."),
    }),
    outputSchema: z.array(z.string()).describe('An array of coordinate strings (latitude,longitude) representing the route path.'),
  },
  async (input) => {
    console.log(`Getting directions from ${input.origin} to ${input.destination}`);
    return await getDirections(input.origin, input.destination);
  }
);
