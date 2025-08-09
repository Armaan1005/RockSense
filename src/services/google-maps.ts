
import { Client, LatLng } from "@googlemaps/google-maps-services-js";
import { decode } from 'polyline';

const client = new Client({});

/**
 * Fetches directions from Google Maps and returns a decoded polyline.
 * @param origin The starting point for the directions, e.g., "40.7128,-74.0060".
 * @param destination The ending point for the directions, e.g., "34.0522,-118.2437".
 * @returns A promise that resolves to an array of coordinate strings.
 */
export async function getDirections(origin: string, destination: string): Promise<string[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API key not found. Returning straight line path.");
        // Fallback to a straight line if no API key is present
        return [origin, destination];
    }
    
    try {
        const response = await client.directions({
            params: {
                origin: origin,
                destination: destination,
                key: apiKey,
            },
            timeout: 5000, // timeout in milliseconds
        });

        if (response.data.routes.length > 0) {
            const polyline = response.data.routes[0].overview_polyline.points;
            const decodedPath: LatLng[] = decode(polyline); // The polyline library returns an array of [lat, lng] tuples
            return decodedPath.map(([lat, lng]) => `${lat},${lng}`);
        } else {
            console.warn("No routes found by Google Maps. Returning straight line path.");
            return [origin, destination];
        }
    } catch (error) {
        console.error("Error fetching directions from Google Maps:", error);
        // Fallback to a straight line on API error
        return [origin, destination];
    }
}
