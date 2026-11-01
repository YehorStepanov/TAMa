// Sfide foto: l'app ne estrae una a caso.
export const CHALLENGES = [
  'Ask someone to take your photo',
  'Selfie with at least 3 people',
  'Group photo with someone you just met',
  'Strike the same pose as another person',
  'Photo with someone from another country',
  'Take a photo of two strangers high-fiving',
];

export function randomChallenge(exclude?: string): string {
  const pool = CHALLENGES.filter((c) => c !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
