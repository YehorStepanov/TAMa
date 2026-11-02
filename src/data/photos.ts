import type { ImageSourcePropType } from 'react-native';

// Foto "caricate dagli altri utenti", per ora lette dalla cartella assets/event-photos
// (una sola cartella, senza sottocartelle). Basta copiarci dentro le immagini.
// NB: gli argomenti di require.context devono restare valori fissi, non variabili.
const context = (require as any).context('../../assets/event-photos', false, /\.(jpe?g|png|webp)$/i);

const ALL_PHOTOS: ImageSourcePropType[] = context.keys().map((key: string) => context(key));

// Per ora tutte le foto vengono mostrate come se fossero dell'evento a cui hai partecipato.
// Più avanti ogni evento avrà le sue foto, in arrivo dal server.
export function photosForEvent(_eventId: string): ImageSourcePropType[] {
  return ALL_PHOTOS;
}
