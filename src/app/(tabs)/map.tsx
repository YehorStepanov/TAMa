import { StyleSheet, Text, View } from 'react-native';
import { EventsMap } from '@/components/EventsMap';
import { Screen } from '@/components/Screen';
import { colors, sizes } from '@/theme';

// La mappa degli eventi di Brno.
export default function MapScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Events around Brno. Tap a pin to see more.</Text>
      </View>
      <EventsMap />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: sizes.margin, paddingTop: 12, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 2 },
});
