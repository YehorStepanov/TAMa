import type { ApiEvent } from '@/lib/api';
import { clock, dayLabel, eventTime } from '@/lib/format';

export type EventItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: string; // il tag (tipo di evento)
  coverUrl: string | null;
  day: string; // 'Today', 'Tomorrow', 'Sat 29/11'
  time: string; // '7–9 PM' (o, se dura più giorni, '11 AM → Sat 28/11, 10 PM')
  startClock: string; // '7 PM'
  endClock: string; // '9 PM'
  startsAt: Date;
  endsAt: Date;
  photoWindowHours: number; // ore (dopo la fine) in cui si può ancora inviare la foto: di solito 24
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
    time: eventTime(startsAt, endsAt),
    startClock: clock(startsAt),
    endClock: clock(endsAt),
    startsAt,
    endsAt,
    photoWindowHours: e.photo_window_hours && e.photo_window_hours > 0 ? e.photo_window_hours : 24,
    place: e.place_name,
    address: e.address,
    lat: e.lat,
    lng: e.lng,
  };
}

const HOUR = 60 * 60 * 1000;

// Un evento resta visibile per almeno 2 giorni dopo la fine (si vedono anche quelli di ieri),
// o più a lungo se la sua finestra per le foto è più lunga (per esempio un viaggio di più giorni).
export function isVisible(e: EventItem, now = Date.now()): boolean {
  const keep = Math.max(48, e.photoWindowHours) * HOUR;
  return e.endsAt.getTime() > now - keep;
}

export type PhotoStatus = 'upcoming' | 'open' | 'closed';

// 'upcoming' = non è ancora iniziato, 'open' = si può inviare la foto, 'closed' = troppo tardi.
// La foto si invia dall'inizio dell'evento fino a `photoWindowHours` dopo la fine (di solito 24 ore).
export function photoStatus(e: EventItem, now = Date.now()): PhotoStatus {
  if (now < e.startsAt.getTime()) return 'upcoming';
  if (now > e.endsAt.getTime() + e.photoWindowHours * HOUR) return 'closed';
  return 'open';
}

// "24 hours", "3 days"...
export function windowText(hours: number): string {
  return hours % 24 === 0 && hours > 24 ? `${hours / 24} days` : `${hours} hours`;
}
