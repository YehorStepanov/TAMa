export type EventItem = {
  id: string;
  title: string;
  day: string; // 'Today', 'Wed', 'Fri', 'Sat', 'Sun'
  time: string;
  place: string;
  category: string;
};

// Ordine dei giorni per ordinare gli eventi futuri.
export const DAY_ORDER = ['Today', 'Wed', 'Fri', 'Sat', 'Sun'];

// Eventi di prova. Più avanti arriveranno dal server.
export const ALL_EVENTS: EventItem[] = [
  { id: '1', title: 'Masquerade Party', day: 'Today', time: '9 PM–2 AM', place: 'Grand Hall', category: 'Party' },
  { id: '2', title: 'Karaoke', day: 'Today', time: '8–11 PM', place: 'The Mic Bar', category: 'Music' },
  { id: '3', title: 'Hike', day: 'Sun', time: '9 AM–2 PM', place: 'Hilltop Trail', category: 'Outdoors' },
  { id: '4', title: 'Tram Party', day: 'Fri', time: '7–10 PM', place: 'Central Tram Stop', category: 'Party' },
  { id: '5', title: 'Boat Party', day: 'Sat', time: '4–8 PM', place: 'River Pier', category: 'Party' },
  { id: '6', title: 'Treasure Hunt', day: 'Sun', time: '2–5 PM', place: 'Old Town', category: 'Games' },
  { id: '7', title: 'Quiz Night', day: 'Today', time: '7–9 PM', place: 'The Local Pub', category: 'Games' },
  { id: '8', title: 'Campfire Evening', day: 'Fri', time: '7–11 PM', place: 'Riverside Camp', category: 'Outdoors' },
  { id: '9', title: 'International Dinner', day: 'Today', time: '7–10 PM', place: 'Community Hall', category: 'Food' },
  { id: '10', title: 'Pub Crawl', day: 'Sat', time: '8 PM–12 AM', place: 'Old Town Square', category: 'Nightlife' },
  { id: '11', title: 'Laser Tag', day: 'Sun', time: '5–7 PM', place: 'Arena Zone', category: 'Games' },
  { id: '12', title: 'Brewery Tour', day: 'Sat', time: '2–5 PM', place: 'City Brewery', category: 'Food' },
  { id: '13', title: 'Board Game Night', day: 'Wed', time: '7–10 PM', place: 'Café Dado', category: 'Games' },
  { id: '14', title: 'Movie Night', day: 'Today', time: '8–10 PM', place: 'Open-Air Cinema', category: 'Culture' },
];

// Eventi già presenti nella "mia pagina" all'avvio.
export const INITIAL_MY_IDS = ['1', '2', '7', '9'];

// Eventi a cui l'utente ha partecipato (hanno la bacheca foto).
// Per ora vuoto: per provare la bacheca scrivi qui un id, per esempio ['2'].
export const INITIAL_ATTENDED_IDS: string[] = [];
