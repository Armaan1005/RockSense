# **App Name**: SnowTrace

## Core Features:

- Interactive Map: Display interactive map with pan and zoom, using Leaflet.js and OpenStreetMap tiles.
- Avalanche Zone Marking: Allow users to mark avalanche zones by clicking on the map, represented by a semi-transparent polygon.
- Victim Location Input: Enable users to input or click to add victim locations, indicated by red markers with ID numbers.
- Rescue Base Selection: Allow users to select a rescue base location, shown as a green marker on the map.
- AI Route Planning: Generate 2-3 color-coded, non-overlapping, and terrain-aware search and rescue routes from the base to victim locations using AI as a planning tool, using Leaflet Routing Machine for path simulation.  These routes are optimal routes, meaning they account for weather and time information.
- Victim Probability Heatmap: Display a simulated heatmap overlay indicating probability of finding victims, with reds representing high-risk zones and blues representing low-risk zones.  Use AI as a planning tool to generate the information behind the simulated data, accounting for weather and time.
- Real-time Team Movement Simulation: Simulate real-time movement of rescue teams along generated routes, displayed as animated rescue icons. Mock data for team ETA, accounting for changing conditions like weather.

## Style Guidelines:

- Primary color: Icy blue (#90B4BE), evokes a sense of cold and urgency.
- Background color: Off-white (#F5F5F5), for a calm and neutral backdrop.
- Accent color: Safety orange (#FF7F50), to highlight critical actions and alerts.
- Font: 'Inter' (sans-serif) for clear, bold headings and body text.
- Utilize rescue icons from react-icons or custom SVGs.
- Implement a left-right layout with an interactive map on the left and a vertical side panel on the right.
- Add snow particle animation overlay for dramatic effect.