import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { fromApiPhoto, type Instant } from '@/data/photos';
import { getEventPhotos } from '@/lib/api';
import { colors, sizes } from '@/theme';

const ROTATIONS = ['-8deg', '6deg', '0deg'];

// Una "pila" di instants, come nelle foto di Instagram: le prime tre foto degli altri, un po' inclinate.
function EventStack({ event }: { event: EventItem }) {
  const [photos, setPhotos] = useState<Instant[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getEventPhotos(event.id)
        .then((list) => alive && setPhotos(list.map(fromApiPhoto)))
        .catch(() => alive && setPhotos([]));
      return () => {
        alive = false;
      };
    }, [event.id]),
  );

  const shown = (photos ?? []).slice(0, 3).reverse(); // l'ultima disegnata resta sopra

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open instants from ${event.title}`}
      onPress={() => router.push({ pathname: '/instants', params: { id: event.id } })}
      style={styles.tile}>
      <View style={styles.stack}>
        {shown.length === 0 ? (
          <View style={[styles.stackCard, styles.stackEmpty]}>
            <Text style={{ fontSize: 44 }}>{event.emoji}</Text>
          </View>
        ) : (
          shown.map((p, i) => (
            <Image key={p.key} source={{ uri: p.thumb }} resizeMode="cover" style={[styles.stackCard, { transform: [{ rotate: ROTATIONS[i % 3] }] }]} />
          ))
        )}
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventLine}>{photos === null ? 'Loading…' : `${photos.length} instants`}</Text>
    </Pressable>
  );
}

// Bacheca foto: una pila per ogni evento a cui ho partecipato.
export default function PhotosScreen() {
  const { attendedEvents, myPhotos, allEvents, metaFor, refreshMyPhotos } = useEvents();

  useFocusEffect(
    useCallback(() => {
      refreshMyPhotos();
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  // La mia foto più recente: la vedo qui, mai nella pila (così non posso reagire alla mia).
  const mine = myPhotos[0];
  const mineEvent = mine ? allEvents.find((e) => e.id === mine.event_id) : undefined;
  const meta = mine ? metaFor(mine.event_id) : undefined;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Photo wall</Text>
        <Text style={styles.subtitle}>Instants from your events · last 24 hours</Text>

        {attendedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No instants yet</Text>
            <Text style={styles.emptyText}>
              Complete a challenge and send your photo. Then you can see the instants from that event, for 24 hours.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {attendedEvents.map((event) => (
                <EventStack key={event.id} event={event} />
              ))}
            </View>

            {mine && (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Image source={{ uri: mine.thumb_url }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Your instant{mineEvent ? ` · ${mineEvent.title}` : ''}</Text>
                    {meta && (
                      <Text style={styles.eventLine}>
                        {meta.type === 'group' ? '👥 Group' : '👤 Solo'} · {meta.level} · +{meta.points} pts
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.big}>{mine.reactions_count ?? 0}</Text>
                    <Text style={styles.eventLine}>reactions</Text>
                  </View>
                </View>
                {meta?.challenge ? <Text style={styles.challengeLine}>{meta.challenge}</Text> : null}
                <Text style={styles.eventLine}>Only you can see this</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  challengeLine: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 10 },
  big: { fontSize: 24, fontWeight: '700', color: colors.text },
});
