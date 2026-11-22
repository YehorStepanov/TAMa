import type { ApiEmoji } from '@/lib/api';

// Le cinque reazioni: l'emoji mostrata nell'app e il nome che il server si aspetta.
export const REACTIONS: { emoji: string; api: ApiEmoji }[] = [
  { emoji: '🔥', api: 'Fire' },
  { emoji: '😂', api: 'Laughing' },
  { emoji: '❤️', api: 'Heart' },
  { emoji: '😮', api: 'Surprised' },
  { emoji: '🎉', api: 'Party_Popper' },
];
