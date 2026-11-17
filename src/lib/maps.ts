import { Alert, Linking } from 'react-native';

// Apre Google Maps con le indicazioni dalla posizione attuale fino all'indirizzo dell'evento.
// Non servono chiavi o permessi: basta l'indirizzo scritto nell'evento.
export function openDirections(address: string) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  Linking.openURL(url).catch(() => Alert.alert('Cannot open Google Maps', 'Check that a maps app or a browser is installed.'));
}
