import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { API_URL, REQUEST_TIMEOUT_MS } from '@/config';

// ---- Tipi delle risposte del server ----
export type ApiTag = { _id: string; name: string; emoji?: string };
export type ApiEvent = {
  _id: string;
  title: string;
  description?: string;
  cover_image_url: string;
  tag_id: ApiTag | null;
  starts_at: string;
  ends_at: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  emoji?: string | null;
  status: string;
};
export type ApiPhoto = {
  _id: string;
  event_id: string;
  device_id: string;
  image_url: string;
  thumb_url: string;
  expires_at: string;
  created_at: string;
  reactions_count?: number;
};
export type ApiEmoji = 'Fire' | 'Laughing' | 'Heart' | 'Surprised' | 'Party_Popper';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---- Identificativo del telefono: il server riconosce l'utente dall'header x-device-id ----
let deviceIdPromise: Promise<string> | null = null;
export function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = (async () => {
      const saved = await AsyncStorage.getItem('deviceId');
      if (saved) return saved;
      const id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 8)}`;
      await AsyncStorage.setItem('deviceId', id);
      return id;
    })();
  }
  return deviceIdPromise;
}

async function request<T>(path: string, init: { method?: string; body?: FormData | string; json?: boolean } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { 'x-device-id': await getDeviceId() };
    if (init.json) headers['Content-Type'] = 'application/json';
    const res = await fetch(API_URL + path, { method: init.method ?? 'GET', body: init.body, headers, signal: controller.signal });
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, body?.message ?? `Error ${res.status}`);
    return body as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === 'AbortError') throw new ApiError(0, 'The server is taking too long to answer. Try again in a minute.');
    throw new ApiError(0, `Cannot reach the server (${(e as Error).message}). Check your connection.`);
  } finally {
    clearTimeout(timer);
  }
}

// ---- Chiamate ----
export const getEvents = () => request<{ data: ApiEvent[] }>('/events').then((r) => r.data);
export const getEventPhotos = (eventId: string) => request<{ data: ApiPhoto[] }>(`/events/${eventId}/photos`).then((r) => r.data);
export const getMyPhotos = () => request<{ data: ApiPhoto[] }>('/me/photos').then((r) => r.data);

// Il caricamento usa l'invio nativo del telefono (più affidabile di FormData con i file su Android).
export async function uploadPhoto(eventId: string, uri: string): Promise<ApiPhoto> {
  const mimeType = /\.png$/i.test(uri) ? 'image/png' : 'image/jpeg';
  let res: FileSystem.FileSystemUploadResult;
  try {
    res = await FileSystem.uploadAsync(`${API_URL}/events/${eventId}/photo`, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'photo', // il nome del campo che il server si aspetta
      mimeType,
      headers: { 'x-device-id': await getDeviceId() },
    });
  } catch (e) {
    throw new ApiError(0, `Cannot reach the server (${(e as Error).message}).`);
  }
  let body: { data?: ApiPhoto; message?: string } = {};
  try {
    body = JSON.parse(res.body);
  } catch {
    // risposta non JSON: uso solo il codice
  }
  if (res.status < 200 || res.status >= 300) throw new ApiError(res.status, body.message ?? `Error ${res.status}`);
  return body.data as ApiPhoto;
}

export function addReaction(photoId: string, emoji: ApiEmoji): Promise<void> {
  return request(`/photos/${photoId}/reactions`, { method: 'POST', json: true, body: JSON.stringify({ emoji }) });
}
