import type { ImageSourcePropType } from 'react-native';

// Foto "caricate dagli altri utenti", per ora lette dalla cartella assets/event-photos
// (una sola cartella, senza sottocartelle). Basta copiarci dentro le immagini.
// NB: gli argomenti di require.context devono restare valori fissi, non variabili.
const context = (require as any).context('../../assets/event-photos', false, /\.(jpe?g|png|webp)$/i);

const ALL_PHOTOS: ImageSourcePropType[] = context.keys().map((key: string) => context(key));

export type Instant = { key: string; source: ImageSourcePropType; mine: boolean };

// Gli "instants" di un evento: prima le mie foto, poi quelle degli altri.
// Per ora tutte le foto della cartella vengono mostrate come se fossero dell'evento.
// Più avanti ogni evento avrà le sue foto, in arrivo dal server.
export function instantsForEvent(eventId: string, myUris: string[]): Instant[] {
  const mine = myUris.map((uri, i) => ({ key: `${eventId}-me-${i}`, source: { uri } as ImageSourcePropType, mine: true }));
  const others = ALL_PHOTOS.map((source, i) => ({ key: `${eventId}-o-${i}`, source, mine: false }));
  return [...mine, ...others];
}
