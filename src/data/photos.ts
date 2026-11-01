// Foto di prova (colori al posto delle immagini). Ogni foto appartiene a un evento.
const TONES = ['#9DB3BA', '#C9BBA3', '#A9BFAE', '#C7B7BE', '#B5B9C9', '#D0C6AE'];

export type PhotoItem = { id: string; eventId: string; color: string };

export function photosForEvent(eventId: string): PhotoItem[] {
  return TONES.map((color, i) => ({ id: `${eventId}-${i}`, eventId, color }));
}
