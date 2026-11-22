import type { ApiEvent } from '@/lib/api';
import { dayLabel, timeRange } from '@/lib/format';

export type EventItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: string; // il tag (tipo di evento)
  coverUrl: string | null;
  day: string; // 'Today', 'Tomorrow', 'Sat 29/11'
  time: string; // '7–9 PM'
  startsAt: Date;
  endsAt: Date;
  place: string;
  address: string; // usato per aprire Google Maps
  lat: number;
  lng: number;
};

// Trasforma un evento del server nel formato usato dall'app.
export function fromApi(e: ApiEvent): EventItem {
  const startsAt = new Date(e.starts_at);
  const endsAt = new Date(e.ends_at);
  return {
    id: e._id,
    title: e.title,
    emoji: e.emoji || e.tag_id?.emoji || '🎉',
    description: e.description ?? '',
    category: e.tag_id?.name ?? 'Event',
    coverUrl: e.cover_image_url || null,
    day: dayLabel(startsAt),
    time: timeRange(startsAt, endsAt),
    startsAt,
    endsAt,
    place: e.place_name,
    address: e.address,
    lat: e.lat,
    lng: e.lng,
  };
}

const HOUR = 60 * 60 * 1000;

// Un evento resta visibile finché non sono passati più di due giorni dalla sua fine (si vedono anche quelli di ieri).
export const VISIBLE_AFTER_END_MS = 48 * HOUR;
// La foto si può inviare dall'inizio dell'evento fino a 24 ore dopo la fine (anche il giorno dopo).
export const PHOTO_WINDOW_AFTER_END_MS = 24 * HOUR;

export function isVisible(e: EventItem, now = Date.now()): boolean {
  return e.endsAt.getTime() > now - VISIBLE_AFTER_END_MS;
}

export type PhotoStatus = 'upcoming' | 'open' | 'closed';

// 'upcoming' = non è ancora iniziato, 'open' = si può inviare la foto, 'closed' = troppo tardi.
export function photoStatus(e: EventItem, now = Date.now()): PhotoStatus {
  if (now < e.startsAt.getTime()) return 'upcoming';
  if (now > e.endsAt.getTime() + PHOTO_WINDOW_AFTER_END_MS) return 'closed';
  return 'open';
}
