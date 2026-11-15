import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddressLink } from '@/components/AddressLink';
import { SmallButton } from '@/components/SmallButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

// Centro di Brno: per ora la mappa parte sempre da qui.
const BRNO = { latitude: 49.1951, longitude: 16.6068, latitudeDelta: 0.09, longitudeDelta: 0.09 };

export default function MapScreen() {
  const { allEvents, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = allEvents.find((e) => e.id === selectedId);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Events in Brno · tap a pin</Text>
      </View>

      <MapView style={styles.map} initialRegion={BRNO} onPress={() => setSelectedId(null)}>
        {allEvents.map((e) => {
          const mine = isOnMyPage(e.id);
          return (
            <Marker
              key={e.id}
              coordinate={{ latitude: e.lat, longitude: e.lng }}
              onPress={() => setSelectedId(e.id)}
              tracksViewChanges={false}
              title={e.title}>
              <View style={[styles.pin, mine && styles.pinMine, selectedId === e.id && styles.pinSelected]}>
                <Text style={styles.pinEmoji}>{e.emoji}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {selected && (
        <View style={styles.sheet}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>
              {selected.emoji} {selected.title}
            </Text>
            <Text style={styles.sheetLine}>
              {selected.day} · {selected.time} · {selected.place}
            </Text>
            <AddressLink address={selected.address} />
          </View>
          {isOnMyPage(selected.id) ? (
            <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${selected.title} from my page`} onPress={() => removeFromMyPage(selected.id)} />
          ) : (
            <SmallButton label="Add" accessibilityLabel={`Add ${selected.title} to my page`} onPress={() => addToMyPage(selected.id)} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: sizes.margin, paddingTop: 16, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  map: { flex: 1 },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinMine: { borderColor: colors.primary },
  pinSelected: { borderWidth: 4, borderColor: colors.primary },
  pinEmoji: { fontSize: 22 },
  sheet: {
    position: 'absolute',
    left: sizes.margin,
    right: sizes.margin,
    bottom: 16,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    elevation: 6,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sheetLine: { fontSize: 14, color: colors.muted, marginTop: 2 },
});
