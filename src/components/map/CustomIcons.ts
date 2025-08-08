import L from 'leaflet';

const createIcon = (svg: string) => {
  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-none',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

export const baseIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="hsl(142.1 76.2% 36.3%)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
);

export const victimIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="hsl(var(--destructive))" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
);

export const rescueTeamIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-siren"><path d="M5.51 3.23a1 1 0 0 1 1.05 0l5.42 2.92a1 1 0 0 1 0 1.7l-2.42 1.3a1 1 0 0 0 0 1.7l5.42 2.92a1 1 0 0 1 0 1.7l-5.42 2.92a1 1 0 0 1-1.05 0L1.76 15a1 1 0 0 1 0-1.7l2.42-1.3a1 1 0 0 0 0-1.7L1.76 9a1 1 0 0 1 0-1.7Z"/><path d="M18.49 3.23a1 1 0 0 1 1.05 0l3.75 2.02a1 1 0 0 1 0 1.7l-2.42 1.3a1 1 0 0 0 0 1.7l3.75 2.02a1 1 0 0 1 0 1.7l-3.75 2.02a1 1 0 0 1-1.05 0l-3.75-2.02a1 1 0 0 1 0-1.7l2.42-1.3a1 1 0 0 0 0-1.7l-2.42-1.3a1 1 0 0 1 0-1.7Z"/></svg>`
);
