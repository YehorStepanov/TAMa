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
