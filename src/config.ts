// Indirizzo del server (guida: TAMa Backend API Reference).
export const API_URL = 'https://tama-backend-0b23.onrender.com';

// Il server gratuito si "addormenta": la prima richiesta può metterci fino a ~50 secondi.
export const REQUEST_TIMEOUT_MS = 70000;

// Il server per ora accetta solo immagini (multer: image/*). Finché non supporta anche i video,
// le sfide che richiedono un video non vengono proposte. Metti true quando il backend sarà pronto.
export const VIDEO_UPLOAD_ENABLED = false;

