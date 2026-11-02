import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  ALL_EVENTS,
  DAY_ORDER,
  INITIAL_ATTENDED_IDS,
  INITIAL_MY_IDS,
  type EventItem,
} from '@/data/events';

type EventsValue = {
  allEvents: EventItem[];
  myEvents: EventItem[]; // ordinati per giorno
  attendedEvents: EventItem[];
  myPhotos: Record<string, string[]>; // foto scattate da me, per id evento
  isOnMyPage: (id: string) => boolean;
  addToMyPage: (id: string) => void;
  removeFromMyPage: (id: string) => void;
  addMyPhoto: (eventId: string, uri: string) => void; // segna anche l'evento come frequentato
};

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [myIds, setMyIds] = useState<string[]>(INITIAL_MY_IDS);
  const [attendedIds, setAttendedIds] = useState<string[]>(INITIAL_ATTENDED_IDS);
  const [myPhotos, setMyPhotos] = useState<Record<string, string[]>>({});

  const myEvents = ALL_EVENTS.filter((e) => myIds.includes(e.id)).sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  const value: EventsValue = {
    allEvents: ALL_EVENTS,
    myEvents,
    attendedEvents: ALL_EVENTS.filter((e) => attendedIds.includes(e.id)),
    myPhotos,
    isOnMyPage: (id) => myIds.includes(id),
    addToMyPage: (id) => setMyIds((ids) => (ids.includes(id) ? ids : [...ids, id])),
    removeFromMyPage: (id) => setMyIds((ids) => ids.filter((x) => x !== id)),
    addMyPhoto: (eventId, uri) => {
      setMyPhotos((p) => ({ ...p, [eventId]: [uri, ...(p[eventId] ?? [])] }));
      setAttendedIds((ids) => (ids.includes(eventId) ? ids : [...ids, eventId]));
    },
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
