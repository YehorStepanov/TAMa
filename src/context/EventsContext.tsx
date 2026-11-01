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
  isOnMyPage: (id: string) => boolean;
  addToMyPage: (id: string) => void;
  removeFromMyPage: (id: string) => void;
};

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [myIds, setMyIds] = useState<string[]>(INITIAL_MY_IDS);
  const [attendedIds] = useState<string[]>(INITIAL_ATTENDED_IDS);

  const myEvents = ALL_EVENTS.filter((e) => myIds.includes(e.id)).sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  const value: EventsValue = {
    allEvents: ALL_EVENTS,
    myEvents,
    attendedEvents: ALL_EVENTS.filter((e) => attendedIds.includes(e.id)),
    isOnMyPage: (id) => myIds.includes(id),
    addToMyPage: (id) => setMyIds((ids) => (ids.includes(id) ? ids : [...ids, id])),
    removeFromMyPage: (id) => setMyIds((ids) => ids.filter((x) => x !== id)),
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
