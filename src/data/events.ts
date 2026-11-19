export type EventItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  day: string; // 'Today', 'Wed', 'Fri', 'Sat', 'Sun'
  time: string;
  place: string;
  address: string; // usato per aprire Google Maps
  lat: number; // coordinate per la mappa (per ora approssimate, solo per provare)
  lng: number;
  category: string;
};

// Ordine dei giorni per ordinare gli eventi futuri.
export const DAY_ORDER = ['Today', 'Wed', 'Fri', 'Sat', 'Sun'];

// Eventi di prova (indirizzi e coordinate sono luoghi di Brno, solo per provare Maps e la mappa).
// Più avanti arriveranno dal server / dalla pagina web dell'associazione.
export const ALL_EVENTS: EventItem[] = [
  { id: '1', title: 'Masquerade Party', emoji: '🎭', description: 'Dress up and wear a mask for a night of music and mystery. The best mask owns the dance floor.', day: 'Today', time: '9 PM–2 AM', place: 'Grand Hall', address: 'Náměstí Svobody, Brno', category: 'Party', lat: 49.1951, lng: 16.6084 },
  { id: '2', title: 'Karaoke', emoji: '🎤', description: 'Pick a song, grab the mic and sing with strangers. No talent needed, just courage.', day: 'Today', time: '8–11 PM', place: 'The Mic Bar', address: 'Moravské náměstí, Brno', category: 'Music', lat: 49.1997, lng: 16.6088 },
  { id: '3', title: 'Hike', emoji: '🥾', description: 'A relaxed walk through the forest above the city. Bring water and comfortable shoes.', day: 'Sun', time: '9 AM–2 PM', place: 'Hilltop Trail', address: 'Obora Holedná, Brno', category: 'Outdoors', lat: 49.2155, lng: 16.539 },
  { id: '4', title: 'Tram Party', emoji: '🚋', description: 'A party on a moving tram that crosses the city. Music, drinks and new faces between stops.', day: 'Fri', time: '7–10 PM', place: 'Central Tram Stop', address: 'Hlavní nádraží, Brno', category: 'Party', lat: 49.1907, lng: 16.6128 },
  { id: '5', title: 'Boat Party', emoji: '⛵', description: 'Four hours on the water with music and a view of the lake. Limited seats.', day: 'Sat', time: '4–8 PM', place: 'River Pier', address: 'Brněnská přehrada, Brno', category: 'Party', lat: 49.233, lng: 16.524 },
  { id: '6', title: 'Treasure Hunt', emoji: '🗺️', description: 'Teams follow clues through the old town to find the hidden treasure. Mixed teams, no experience needed.', day: 'Sun', time: '2–5 PM', place: 'Old Town', address: 'Zelný trh, Brno', category: 'Games', lat: 49.1932, lng: 16.6087 },
  { id: '7', title: 'Quiz Night', emoji: '🧠', description: 'Trivia in teams of four at the local pub. Questions in English, prizes for the top teams.', day: 'Today', time: '7–9 PM', place: 'The Local Pub', address: 'Husova, Brno', category: 'Games', lat: 49.194, lng: 16.6059 },
  { id: '8', title: 'Campfire Evening', emoji: '🔥', description: 'Songs, stories and marshmallows around the fire by the river. Bring a warm jacket.', day: 'Fri', time: '7–11 PM', place: 'Riverside Camp', address: 'Lužánky, Brno', category: 'Outdoors', lat: 49.2067, lng: 16.6153 },
  { id: '9', title: 'International Dinner', emoji: '🍽️', description: 'Everyone brings a dish from their country. Taste the world and share the story behind it.', day: 'Today', time: '7–10 PM', place: 'Community Hall', address: 'Joštova, Brno', category: 'Food', lat: 49.1938, lng: 16.6111 },
  { id: '10', title: 'Pub Crawl', emoji: '🍻', description: 'Five bars in the old town, one drink in each, and a lot of new friends along the way.', day: 'Sat', time: '8 PM–12 AM', place: 'Old Town Square', address: 'Orlí, Brno', category: 'Nightlife', lat: 49.1925, lng: 16.6075 },
  { id: '11', title: 'Laser Tag', emoji: '🎯', description: 'Two teams, one arena. Fast games, lots of laughs and a rematch for sure.', day: 'Sun', time: '5–7 PM', place: 'Arena Zone', address: 'Výstaviště Brno', category: 'Games', lat: 49.1885, lng: 16.579 },
  { id: '12', title: 'Brewery Tour', emoji: '🍺', description: 'A guided tour of a local brewery, with a tasting at the end. Over 18 only.', day: 'Sat', time: '2–5 PM', place: 'City Brewery', address: 'Mendlovo náměstí, Brno', category: 'Food', lat: 49.1911, lng: 16.6001 },
  { id: '13', title: 'Board Game Night', emoji: '🎲', description: 'Dozens of board games and people to learn them with. Beginners welcome.', day: 'Wed', time: '7–10 PM', place: 'Café Dado', address: 'Kobližná, Brno', category: 'Games', lat: 49.1966, lng: 16.6055 },
  { id: '14', title: 'Movie Night', emoji: '🎬', description: 'An outdoor screening of a classic film under the stars. Bring a blanket.', day: 'Today', time: '8–10 PM', place: 'Open-Air Cinema', address: 'Moravské náměstí, Brno', category: 'Culture', lat: 49.1995, lng: 16.6075 },
];

// Eventi già presenti nella "mia pagina" all'avvio.
export const INITIAL_MY_IDS = ['1', '2', '7', '9'];

// Eventi a cui l'utente ha partecipato (hanno la bacheca foto).
// Per ora vuoto: per provare la bacheca scrivi qui un id, per esempio ['2'].
export const INITIAL_ATTENDED_IDS: string[] = [];
