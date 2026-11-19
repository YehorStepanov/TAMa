import type { ChallengeType } from '@/data/challenges';

// Foto e video "caricati dagli altri utenti", per ora letti dalla cartella assets/event-photos
// (una sola cartella, senza sottocartelle). Basta copiarci dentro i file (jpg, png, webp, mp4, mov).
// NB: gli argomenti di require.context devono restare valori fissi, non variabili.
const context = (require as any).context('../../assets/event-photos', false, /\.(jpe?g|png|webp|mp4|mov|m4v)$/i);

export type MediaSource = number | { uri: string };

export type Instant = {
  key: string;
  source: MediaSource;
  kind: 'image' | 'video';
  challenge: string; // la sfida che ha fatto chi ha inviato il contenuto
  type: ChallengeType;
};

// MOCK: finché non c'è il server, a ogni file della cartella assegniamo una sfida a rotazione.
const MOCK: { challenge: string; type: ChallengeType }[] = [
  { challenge: 'Selfie with at least 3 people', type: 'group' },
  { challenge: 'Strike a funny pose', type: 'solo' },
  { challenge: 'Ask someone to take a photo of you', type: 'group' },
  { challenge: 'Show the mood of the evening in one photo', type: 'solo' },
  { challenge: 'Strike the same pose as another person', type: 'group' },
];

const ALL: Instant[] = (context.keys() as string[]).map((key, i) => ({
  key,
  source: context(key),
  kind: /\.(mp4|mov|m4v)$/i.test(key) ? 'video' : 'image',
  ...MOCK[i % MOCK.length],
}));

// Gli instants di un evento: solo quelli degli altri (i miei non si possono votare).
// Per ora tutti i file della cartella vengono mostrati come se fossero dell'evento.
// Più avanti ogni evento avrà i suoi, in arrivo dal server.
export function instantsForEvent(_eventId: string): Instant[] {
  return ALL;
}
