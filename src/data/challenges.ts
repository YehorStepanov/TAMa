// Sfide: singole o di gruppo, con tre livelli di difficoltà. Più difficile = più punti.
export type Level = 'easy' | 'medium' | 'hard';
export type ChallengeType = 'solo' | 'group';
export type Media = 'photo' | 'video' | 'any';

import { VIDEO_UPLOAD_ENABLED } from '@/config';

// Durata massima dei video (secondi).
export const MAX_VIDEO_SECONDS = 60;

export type Challenge = {
  text: string;
  type: ChallengeType;
  level: Level;
  media: Media;
  custom?: boolean; // creata apposta per quell'evento
};

export const LEVELS: { key: Level; label: string; points: number }[] = [
  { key: 'easy', label: 'Easy', points: 30 },
  { key: 'medium', label: 'Medium', points: 50 },
  { key: 'hard', label: 'Hard', points: 80 },
];

// Livello di partenza: si può cambiare quando si sceglie l'evento.
export const DEFAULT_LEVEL: Level = 'medium';

export function pointsFor(level: Level): number {
  return LEVELS.find((l) => l.key === level)?.points ?? 50;
}

// Sfide generali, valide per qualsiasi evento.
export const CHALLENGES: Challenge[] = [
  { text: 'Take a photo of the best detail of the place', type: 'solo', level: 'easy', media: 'photo' },
  { text: 'Selfie with the event poster or sign', type: 'solo', level: 'easy', media: 'photo' },
  { text: 'Ask someone to take a photo of you', type: 'group', level: 'easy', media: 'photo' },
  { text: 'Photo of two people toasting (ask them first)', type: 'group', level: 'easy', media: 'photo' },

  { text: 'Strike a funny pose', type: 'solo', level: 'medium', media: 'photo' },
  { text: 'Show the mood of the evening in one photo', type: 'solo', level: 'medium', media: 'photo' },
  { text: 'Your best dance move (photo or video)', type: 'solo', level: 'medium', media: 'any' },
  { text: 'Selfie with at least 3 people', type: 'group', level: 'medium', media: 'photo' },
  { text: 'Strike the same pose as another person', type: 'group', level: 'medium', media: 'photo' },
  { text: 'Photo with someone from another country', type: 'group', level: 'medium', media: 'photo' },

  { text: 'Film a 10-second video of you dancing', type: 'solo', level: 'hard', media: 'video' },
  { text: 'Film a 15-second video: introduce the event like a TV reporter', type: 'solo', level: 'hard', media: 'video' },
  { text: 'Film 3 people saying hello in 3 different languages', type: 'group', level: 'hard', media: 'video' },
  { text: 'Film a group cheer with at least 4 people', type: 'group', level: 'hard', media: 'video' },
  { text: 'Recreate a famous movie scene with 3 people', type: 'group', level: 'hard', media: 'photo' },
  { text: 'Group photo with 6 people from 4 different countries', type: 'group', level: 'hard', media: 'photo' },
  { text: 'Photo of 5 strangers striking the same pose', type: 'group', level: 'hard', media: 'photo' },
];

// Sfide personalizzate per evento (chiave = titolo dell'evento in minuscolo).
// Più avanti le inserirà l'organizzatore dal sito, insieme all'evento.
const CUSTOM_BY_TITLE: Record<string, Challenge[]> = {
  'masquerade party': [
    { text: 'Photo with the most original mask in the room', type: 'group', level: 'easy', media: 'photo' },
    { text: 'Film a 10-second video of you as your mask character', type: 'solo', level: 'hard', media: 'video' },
  ],
  karaoke: [{ text: 'Sing the chorus together with someone you just met', type: 'group', level: 'hard', media: 'video' }],
  'quiz night': [{ text: 'Team photo holding a paper with your team name', type: 'group', level: 'medium', media: 'photo' }],
  'international dinner': [{ text: 'Photo of a dish from another country with the person who brought it', type: 'group', level: 'medium', media: 'photo' }],
};

export function customFor(title: string): Challenge[] {
  return CUSTOM_BY_TITLE[title.trim().toLowerCase()] ?? [];
}

// Estrae una sfida del livello scelto. Quelle dell'evento pesano il doppio.
export function drawChallenge(level: Level, custom: Challenge[] = [], exclude?: string): Challenge {
  // Se il server non accetta ancora i video, le sfide solo-video non si propongono e "foto o video" diventa "foto".
  const usable = (c: Challenge): Challenge | null => {
    if (VIDEO_UPLOAD_ENABLED) return c;
    if (c.media === 'video') return null;
    return c.media === 'any' ? { ...c, media: 'photo' } : c;
  };
  const own = custom.filter((c) => c.level === level).map((c) => usable({ ...c, custom: true })).filter((c): c is Challenge => c !== null);
  const general = CHALLENGES.filter((c) => c.level === level).map(usable).filter((c): c is Challenge => c !== null);
  const pool = [...own, ...own, ...general].filter((c) => c.text !== exclude);
  const list = pool.length > 0 ? pool : general;
  return list[Math.floor(Math.random() * list.length)];
}
