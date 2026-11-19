import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ChallengeType, Level } from '@/data/challenges';
import {
  ALL_EVENTS,
  DAY_ORDER,
  INITIAL_ATTENDED_IDS,
  INITIAL_MY_IDS,
  type EventItem,
} from '@/data/events';

// Quello che ho inviato per completare la sfida di un evento (una sola volta per evento).
export type Submission = {
  uri: string;
  kind: 'image' | 'video';
  challenge: string;
  type: ChallengeType;
  level: Level;
  points: number;
};

type EventsValue = {
  allEvents: EventItem[];
  myEvents: EventItem[]; // ordinati per giorno
  attendedEvents: EventItem[];
  submissions: Record<string, Submission>; // le mie foto/video, per id evento
  points: number;
  isOnMyPage: (id: string) => boolean;
  isCompleted: (id: string) => boolean; // missione già fatta (una sola foto per evento)
  addToMyPage: (id: string) => void;
  removeFromMyPage: (id: string) => void;
  addSubmission: (eventId: string, submission: Submission) => void; // segna l'evento come completato e aggiunge i punti
};

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [myIds, setMyIds] = useState<string[]>(INITIAL_MY_IDS);
  const [attendedIds, setAttendedIds] = useState<string[]>(INITIAL_ATTENDED_IDS);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [points, setPoints] = useState(120);

  const myEvents = ALL_EVENTS.filter((e) => myIds.includes(e.id)).sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  const value: EventsValue = {
    allEvents: ALL_EVENTS,
    myEvents,
    attendedEvents: ALL_EVENTS.filter((e) => attendedIds.includes(e.id)),
    submissions,
    points,
    isOnMyPage: (id) => myIds.includes(id),
    isCompleted: (id) => attendedIds.includes(id),
    addToMyPage: (id) => setMyIds((ids) => (ids.includes(id) ? ids : [...ids, id])),
    removeFromMyPage: (id) => setMyIds((ids) => ids.filter((x) => x !== id)),
    addSubmission: (eventId, submission) => {
      if (attendedIds.includes(eventId)) return; // una sola foto o video per evento
      setSubmissions((p) => ({ ...p, [eventId]: submission }));
      setAttendedIds((ids) => [...ids, eventId]);
      setPoints((n) => n + submission.points);
    },
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
