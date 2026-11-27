import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { fromApi, isVisible, type EventItem } from '@/data/events';
import { pointsFor, type ChallengeType, type Level } from '@/data/challenges';
import { ApiError, addReaction, getEvents, getMyPhotos, uploadPhoto, type ApiEmoji, type ApiPhoto } from '@/lib/api';
import { POINTS_PER_REACTION, weeklyStreak } from '@/lib/stats';

// Quello che il server non salva: la sfida fatta (resta sul telefono).
export type SubmissionMeta = { challenge: string; type: ChallengeType; level: Level };

type EventsValue = {
  allEvents: EventItem[];
  visibleEvents: EventItem[]; // senza quelli finiti da più di due giorni
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  refresh: () => Promise<void>; // aggiornamento a mano (tirando giù la lista)
  refreshing: boolean;
  points: number; // punti veri: sfide fatte + 5 per ogni reazione ricevuta
  streak: number; // settimane di fila con almeno una sfida
  reactionsReceived: number;
  pointsFor: (eventId: string) => number; // punti guadagnati con la sfida di quell'evento (sfida + reazioni)
  calendarEvents: EventItem[]; // salvati o già fatti (anche passati)
  myReaction: (photoId: string) => ApiEmoji | undefined; // la mia reazione a una foto (una sola)
  react: (photoId: string, emoji: ApiEmoji) => void;
  refreshMyPhotos: () => Promise<void>;

  myEvents: EventItem[]; // salvati, in ordine di data
  isOnMyPage: (id: string) => boolean;
  addToMyPage: (id: string) => void;
  removeFromMyPage: (id: string) => void;

  myPhotos: ApiPhoto[]; // le foto che ho inviato (dal server)
  isCompleted: (eventId: string) => boolean; // ho già inviato la foto di questo evento
  attendedEvents: EventItem[];
  photoFor: (eventId: string) => ApiPhoto | undefined;
  metaFor: (eventId: string) => SubmissionMeta | undefined;
  submitPhoto: (eventId: string, uri: string, meta: SubmissionMeta) => Promise<void>;
};

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myIds, setMyIds] = useState<string[]>([]);
  const [myPhotos, setMyPhotos] = useState<ApiPhoto[]>([]);
  const [meta, setMeta] = useState<Record<string, SubmissionMeta>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [reactions, setReactions] = useState<Record<string, ApiEmoji>>({});
  const busy = useRef(false);

  // 'initial' mostra il caricamento, 'manual' la rotellina del "tira per aggiornare", 'quiet' aggiorna in silenzio.
  const load = useCallback(async (mode: 'initial' | 'manual' | 'quiet') => {
    if (busy.current) return;
    busy.current = true;
    if (mode === 'initial') {
      setLoading(true);
      setError(null);
    }
    if (mode === 'manual') setRefreshing(true);
    try {
      const [events, photos] = await Promise.all([getEvents(), getMyPhotos()]);
      setAllEvents(events.map(fromApi));
      setMyPhotos(photos);
      setError(null);
    } catch (e) {
      if (mode !== 'quiet') setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      busy.current = false;
      if (mode === 'initial') setLoading(false);
      if (mode === 'manual') setRefreshing(false);
    }
  }, []);
  const reload = useCallback(() => load('initial'), [load]);
  const refresh = useCallback(() => load('manual'), [load]);

  // Aggiorna gli eventi da soli: ogni minuto, e ogni volta che torni nell'app.
  useEffect(() => {
    const timer = setInterval(() => load('quiet'), 60000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load('quiet');
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [load]);

  // All'avvio: recupero i dati salvati sul telefono e chiedo gli eventi al server.
  useEffect(() => {
    AsyncStorage.multiGet(['myIds', 'meta', 'reactions'])
      .then((pairs) => {
        const get = (k: string) => pairs.find(([key]) => key === k)?.[1];
        try {
          if (get('myIds')) setMyIds(JSON.parse(get('myIds')!));
          if (get('meta')) setMeta(JSON.parse(get('meta')!));
          if (get('reactions')) setReactions(JSON.parse(get('reactions')!));
        } catch {
          // dati rovinati: si riparte da zero
        }
      })
      .catch(() => undefined);
    load('initial');
  }, [load]);

  function saveIds(next: string[]) {
    setMyIds(next);
    AsyncStorage.setItem('myIds', JSON.stringify(next));
  }

  const myEvents = allEvents.filter((e) => myIds.includes(e.id) && isVisible(e)).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const completedIds = myPhotos.map((p) => p.event_id);

  // Punti veri: dai dati dei miei invii. Se la sfida di una foto non è nota (per esempio dopo una reinstallazione) conto 50.
  const challengePoints = (eventId: string) => pointsFor(meta[eventId]?.level ?? 'medium');
  const reactionsReceived = myPhotos.reduce((n, p) => n + (p.reactions_count ?? 0), 0);
  const points = myPhotos.reduce((n, p) => n + challengePoints(p.event_id), 0) + POINTS_PER_REACTION * reactionsReceived;
  const streak = weeklyStreak(myPhotos.map((p) => new Date(p.created_at)));
  const calendarEvents = allEvents.filter((e) => myIds.includes(e.id) || completedIds.includes(e.id));

  const value: EventsValue = {
    allEvents,
    visibleEvents: allEvents.filter((e) => isVisible(e)),
    loading,
    error,
    reload,
    refresh,
    refreshing,
    points,
    streak,
    reactionsReceived,
    pointsFor: (id) => {
      const photo = myPhotos.find((p) => p.event_id === id);
      return photo ? challengePoints(id) + POINTS_PER_REACTION * (photo.reactions_count ?? 0) : 0;
    },
    calendarEvents,
    myReaction: (photoId) => reactions[photoId],
    react: (photoId, emoji) => {
      if (reactions[photoId] === emoji) return; // la stessa reazione non conta una seconda volta
      const next = { ...reactions, [photoId]: emoji };
      setReactions(next);
      AsyncStorage.setItem('reactions', JSON.stringify(next));
      addReaction(photoId, emoji).catch(() => undefined); // il server tiene una sola reazione per persona (da concordare col backend)
    },
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
      setMyPhotos((p) => [photo, ...p]);
      setMeta(nextMeta);
      AsyncStorage.setItem('meta', JSON.stringify(nextMeta));
    },
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
