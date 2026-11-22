import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { useEvents } from '@/context/EventsContext';
import { colors } from '@/theme';

// Caricamento (il server gratuito può impiegare fino a ~50 secondi a svegliarsi) ed errori, con "Try again".
export function ServerStatus() {
  const { loading, error, reload } = useEvents();
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>Loading events…</Text>
        <Text style={styles.small}>The first time can take up to a minute while the server wakes up.</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>{error}</Text>
        <AppButton label="Try again" onPress={reload} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  box: { marginTop: 24, alignItems: 'center', gap: 12 },
  text: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  small: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
