import type { ApiPhoto } from '@/lib/api';

// Una foto di un altro partecipante, pronta per essere mostrata.
export type Instant = {
  key: string; // id della foto sul server (serve per le reazioni)
  full: string; // immagine intera
  thumb: string; // miniatura quadrata
};

export function fromApiPhoto(p: ApiPhoto): Instant {
  return { key: p._id, full: p.image_url, thumb: p.thumb_url };
}
