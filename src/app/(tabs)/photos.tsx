import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MemoryCard } from '@/components/MemoryCard';
import { Screen, useTabSpace } from '@/components/Screen';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { fromApiPhoto, type Instant } from '@/data/photos';
import { getEventPhotos } from '@/lib/api';
import { colors, sizes, r } from '@/theme';

const ROTATIONS = ['-8deg', '6deg', '0deg'];

// Una "pila" di foto degli altri partecipanti, un po' inclinate.
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
      accessibilityLabel={`Open photos from ${event.title}`}
      onPress={() => router.push({ pathname: '/instants', params: { id: event.id } })}
      style={styles.tile}>
      <View style={styles.stack}>
        {shown.length === 0 ? (
          <View style={[styles.stackCard, styles.stackEmpty]}>
            <Text style={{ fontSize: 44 }}>{event.emoji}</Text>
          </View>
        ) : (
          shown.map((p, i) => <Image key={p.key} source={{ uri: p.thumb }} resizeMode="cover" style={[styles.stackCard, { transform: [{ rotate: ROTATIONS[i % 3] }] }]} />)
        )}
      </View>
      <Text style={styles.eventTitle} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.eventLine}>{photos === null ? 'Loading…' : `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`}</Text>
    </Pressable>
  );
}

// Photos: prima le TUE foto (grandi, con sfida e reazioni), poi le foto degli altri partecipanti dei tuoi eventi.
export default function PhotosScreen() {
  const { attendedEvents, refreshMyPhotos } = useEvents();
  const tabSpace = useTabSpace();

  useFocusEffect(
    useCallback(() => {
      refreshMyPhotos();
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: sizes.margin, paddingTop: 12, paddingBottom: tabSpace, gap: sizes.gap }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Photos</Text>

        {attendedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing to see yet</Text>
            <Text style={styles.emptyText}>Send a photo at an event and everyone else's pictures from it will show up here.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>YOUR PHOTOS</Text>
            {attendedEvents.map((e) => (
              <MemoryCard key={e.id} event={e} onPress={() => router.push({ pathname: '/memory', params: { id: e.id } })} />
            ))}

            <Text style={[styles.label, { marginTop: 12 }]}>FROM YOUR EVENTS</Text>
            <View style={styles.grid}>
              {attendedEvents.map((event) => (
                <EventStack key={event.id} event={event} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.muted, marginTop: 4 },
  empty: { backgroundColor: colors.glass, borderRadius: r(20), borderWidth: 1, borderColor: colors.glassBorder, padding: 18, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 16, lineHeight: 23, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', minHeight: 48 },
  stack: { height: 176, alignItems: 'center', justifyContent: 'center' },
  stackCard: { position: 'absolute', width: 124, height: 160, borderRadius: r(20), borderWidth: 3, borderColor: colors.surface, backgroundColor: colors.tint },
  stackEmpty: { alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  eventLine: { fontSize: 15, color: colors.muted },
});
