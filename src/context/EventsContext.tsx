import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fromApi, type EventItem } from '@/data/events';
import type { ChallengeType, Level } from '@/data/challenges';
import { ApiError, getEvents, getMyPhotos, uploadPhoto, type ApiPhoto } from '@/lib/api';

// Quello che il server non salva: la sfida fatta, il livello e i punti (restano sul telefono).
export type SubmissionMeta = { challenge: string; type: ChallengeType; level: Level; points: number };

type EventsValue = {
  allEvents: EventItem[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  refreshMyPhotos: () => Promise<void>; // aggiorna le mie foto (e il numero di reazioni ricevute)

  myEvents: EventItem[]; // salvati sulla mia pagina, in ordine di data
  isOnMyPage: (id: string) => boolean;
  addToMyPage: (id: string) => void;
  removeFromMyPage: (id: string) => void;

  myPhotos: ApiPhoto[]; // le foto che ho inviato (dal server)
  isCompleted: (eventId: string) => boolean; // ho già inviato la foto di questo evento
  attendedEvents: EventItem[];
  photoFor: (eventId: string) => ApiPhoto | undefined;
  metaFor: (eventId: string) => SubmissionMeta | undefined;
  submitPhoto: (eventId: string, uri: string, meta: SubmissionMeta) => Promise<void>;
  points: number;
};

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myIds, setMyIds] = useState<string[]>([]);
  const [myPhotos, setMyPhotos] = useState<ApiPhoto[]>([]);
  const [meta, setMeta] = useState<Record<string, SubmissionMeta>>({});
  const [points, setPoints] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [events, photos] = await Promise.all([getEvents(), getMyPhotos()]);
      setAllEvents(events.map(fromApi));
      setMyPhotos(photos);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  // All'avvio: recupero i dati salvati sul telefono e chiedo gli eventi al server.
  useEffect(() => {
    AsyncStorage.multiGet(['myIds', 'meta', 'points'])
      .then((pairs) => {
      const get = (k: string) => pairs.find(([key]) => key === k)?.[1];
      try {
        if (get('myIds')) setMyIds(JSON.parse(get('myIds')!));
        if (get('meta')) setMeta(JSON.parse(get('meta')!));
        if (get('points')) setPoints(Number(get('points')) || 0);
      } catch {
        // dati rovinati: si riparte da zero
      }
    })
      .catch(() => undefined);
    reload();
  }, [reload]);

  function saveIds(next: string[]) {
    setMyIds(next);
    AsyncStorage.setItem('myIds', JSON.stringify(next));
  }

  const myEvents = allEvents.filter((e) => myIds.includes(e.id)).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const completedIds = myPhotos.map((p) => p.event_id);

  const value: EventsValue = {
    allEvents,
    loading,
    error,
    reload,
    refreshMyPhotos: () => getMyPhotos().then(setMyPhotos).catch(() => undefined),
    myEvents,
    isOnMyPage: (id) => myIds.includes(id),
    addToMyPage: (id) => saveIds(myIds.includes(id) ? myIds : [...myIds, id]),
    removeFromMyPage: (id) => saveIds(myIds.filter((x) => x !== id)),
    myPhotos,
    isCompleted: (id) => completedIds.includes(id),
    attendedEvents: allEvents.filter((e) => completedIds.includes(e.id)),
    photoFor: (id) => myPhotos.find((p) => p.event_id === id),
    metaFor: (id) => meta[id],
    submitPhoto: async (eventId, uri, m) => {
      const photo = await uploadPhoto(eventId, uri); // se è già stata inviata il server risponde 409
      const nextMeta = { ...meta, [eventId]: m };
      const nextPoints = points + m.points;
      setMyPhotos((p) => [photo, ...p]);
      setMeta(nextMeta);
      setPoints(nextPoints);
      AsyncStorage.multiSet([
        ['meta', JSON.stringify(nextMeta)],
        ['points', String(nextPoints)],
      ]);
    },
    points,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
