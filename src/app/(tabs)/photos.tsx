import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/context/EventsContext';
import { photosForEvent } from '@/data/photos';
import { colors, sizes } from '@/theme';

// Bacheca foto: solo gli eventi a cui ho partecipato, ognuno con il suo titolo.
export default function PhotosScreen() {
  const { attendedEvents, myPhotos } = useEvents();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Photo wall</Text>

        {attendedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptyText}>
              Complete a mission and send your photo. Then you can see the photos from that event, for 24 hours.
            </Text>
          </View>
        ) : (
          attendedEvents.map((event) => {
            const mine = myPhotos[event.id] ?? [];
            const others = photosForEvent(event.id);
            return (
              <View key={event.id} style={styles.group}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLine}>
                  {event.day} · {event.place} · photos stay for 24 hours
                </Text>
                <View style={styles.grid}>
                  {mine.map((uri) => (
                    <View key={uri} style={styles.tile}>
                      <Image source={{ uri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Your photo" />
                      <Text style={styles.badge}>You</Text>
                    </View>
                  ))}
                  {others.map((src, i) => (
                    <View key={`${event.id}-${i}`} style={styles.tile}>
                      <Image source={src} style={styles.photo} resizeMode="cover" accessibilityLabel="Photo from another user" />
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: sizes.margin, paddingTop: 56, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  empty: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 16, lineHeight: 23, color: colors.muted },
  group: { marginTop: 20 },
  eventTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  eventLine: { fontSize: 14, color: colors.muted, marginTop: 2, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', height: 170, borderRadius: 14, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
