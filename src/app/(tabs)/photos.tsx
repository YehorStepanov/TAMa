import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEvents } from '@/context/EventsContext';
import { instantsForEvent, type Instant } from '@/data/photos';
import { MOCK_RECEIVED } from '@/data/reactions';
import { colors, sizes } from '@/theme';

const ROTATIONS = ['-8deg', '6deg', '0deg'];

// Una "pila" di instants, come nelle foto di Instagram: le prime tre foto, un po' inclinate.
function Stack({ instants, emoji }: { instants: Instant[]; emoji: string }) {
  // L'anteprima usa solo immagini (i video non hanno miniatura): l'ultima disegnata resta sopra.
  const shown = instants.filter((i) => i.kind === 'image').slice(0, 3).reverse();
  if (shown.length === 0) {
    return (
      <View style={styles.stack}>
        <View style={[styles.stackCard, styles.stackEmpty]}>
          <Text style={{ fontSize: 44 }}>{emoji}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.stack}>
      {shown.map((it, i) => (
        <Image
          key={it.key}
          source={it.source as number}
          resizeMode="cover"
          style={[styles.stackCard, { transform: [{ rotate: ROTATIONS[i % 3] }] }]}
        />
      ))}
    </View>
  );
}

// Bacheca foto: una pila per ogni evento a cui ho partecipato.
export default function PhotosScreen() {
  const { attendedEvents, submissions } = useEvents();

  const mineEvent = attendedEvents.find((e) => submissions[e.id]);
  const mine = mineEvent ? submissions[mineEvent.id] : undefined;
  const received = MOCK_RECEIVED.reduce((n, r) => n + r.count, 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Photo wall</Text>
        <Text style={styles.subtitle}>Instants from your events · last 24 hours</Text>

        {attendedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No instants yet</Text>
            <Text style={styles.emptyText}>
              Complete a mission and send your photo. Then you can see the instants from that event, for 24 hours.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {attendedEvents.map((event) => {
                // L'anteprima mostra solo le foto degli altri: la mia non si può votare, la vedo nella scheda "Your instant".
                const instants = instantsForEvent(event.id);
                return (
                  <Pressable
                    key={event.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open instants from ${event.title}`}
                    onPress={() => router.push({ pathname: '/instants', params: { id: event.id } })}
                    style={styles.tile}>
                    <Stack instants={instants} emoji={event.emoji} />
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLine}>{instants.length} instants</Text>
                  </Pressable>
                );
              })}
            </View>

            {mineEvent && mine && (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  {mine.kind === 'image' ? (
                    <Image source={{ uri: mine.uri }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbVideo]}>
                      <Text style={{ fontSize: 24 }}>🎬</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Your instant · {mineEvent.title}</Text>
                    <Text style={styles.eventLine}>
                      {mine.type === 'group' ? '👥 Group' : '👤 Solo'} · {mine.level} · +{mine.points} pts
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.big}>{received}</Text>
                    <Text style={styles.eventLine}>reactions</Text>
                  </View>
                </View>
                <Text style={styles.challengeLine}>{mine.challenge}</Text>
                <Text style={styles.eventLine}>Only you can see this</Text>
                <View style={styles.emojiRow}>
                  {MOCK_RECEIVED.map((r) => (
                    <Text key={r.emoji} style={styles.emojiCount}>
                      {r.emoji} {r.count}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: sizes.margin, paddingTop: 56, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  tile: { width: '48%', minHeight: 48 },
  stack: { height: 204, alignItems: 'center', justifyContent: 'center' },
  stackCard: {
    position: 'absolute',
    width: 132,
    height: 176,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.border,
  },
  stackEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint },
  eventTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  eventLine: { fontSize: 13, color: colors.muted },
  card: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.border },
  thumbVideo: { alignItems: 'center', justifyContent: 'center' },
  challengeLine: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  big: { fontSize: 24, fontWeight: '700', color: colors.text },
  emojiRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  emojiCount: { fontSize: 16, fontWeight: '700', color: colors.text },
});
