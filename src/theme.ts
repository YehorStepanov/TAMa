// Colori e misure di AHOJ.
export const colors = {
  bg: '#C9D8E6', // colore di partenza dello sfondo sfumato (serve anche mentre le schermate si aprono)
  gradient: ['#D6E2EE', '#A9C0D6', '#8393C0'] as const, // azzurro chiaro → azzurro → lilla
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.66)', // card "di vetro": bianco trasparente sopra lo sfondo
  glassBorder: 'rgba(255,255,255,0.9)',
  onPrimary: '#FFFFFF', // testo sui pulsanti colorati
  text: '#16212C',
  muted: '#33455A',
  primary: '#4B5FC9', // blu: pulsanti principali ed elementi attivi
  border: 'rgba(255,255,255,0.7)',
  outline: 'rgba(22,33,44,0.35)',
  success: '#1F9D55',
  successBg: '#DDF5E7',
  successText: '#14703C',
  accent: '#B4532A', // terracotta: solo per "sta succedendo adesso"
  night: '#161C21', // sfondo scuro del visualizzatore di foto
  tint: '#E4E9F7', // sfondo delle miniature quando manca la foto di copertina
  sand: '#E9E1D0',
  sandText: '#4A3F2A',
};

// Misure pensate per l'uso con una mano: nessun elemento cliccabile sotto i 48 px.
export const sizes = {
  margin: 14,
  gap: 12,
  radius: 20,
  buttonPrimary: 56,
  buttonSecondary: 48,
  input: 52,
  minTouch: 48,
  navHeight: 68, // barra fluttuante in basso
  navBottom: 14,
  navSide: 36,
};

// Forma di tutta l'app. true = angoli netti (stile "boxy"); false = angoli arrotondati come prima.
export const BOXY = false;
export const r = (n: number): number => (BOXY ? 0 : n);
