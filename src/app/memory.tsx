import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useEvents } from '@/context/EventsContext';
import { LEVELS, pointsFor } from '@/data/challenges';
import { REACTIONS } from '@/data/reactions';
import { longDate } from '@/lib/format';
import { POINTS_PER_REACTION } from '@/lib/stats';
import { colors, sizes, r } from '@/theme';

// Se hai tante reazioni non ne mostriamo mille: al massimo una manciata di emoji, nelle stesse proporzioni.
const MAX_EMOJI = 16;

// Un tuo ricordo: la foto, la sfida che hai fatto e le reazioni che hai ricevuto.
export default function MemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents, photoFor, metaFor, pointsFor: eventPoints } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const photo = photoFor(id ?? '');
  const meta = metaFor(id ?? '');

  if (!event || !photo) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ flex: 1, padding: sizes.margin }}>
          <Text style={styles.title}>We can't find this one</Text>
        </View>
        <View style={styles.bottom}>
          <AppButton label="Back" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const total = photo.reactions_count ?? 0;
  const counts = REACTIONS.map((r) => ({ ...r, n: photo.reactions?.[r.api] ?? 0 })).filter((r) => r.n > 0);
  const known = counts.reduce((n, r) => n + r.n, 0);
  const bouquet = counts.flatMap((r) => Array(Math.max(1, Math.round((r.n / Math.max(known, 1)) * Math.min(known, MAX_EMOJI)))).fill(r.emoji)).slice(0, MAX_EMOJI);
  const level = meta?.level ?? 'medium';
  const base = pointsFor(level);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: sizes.margin, paddingBottom: 12, gap: sizes.gap }} showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrap}>
          <View style={[styles.behind, { transform: [{ rotate: '-5deg' }] }]} />
          <View style={[styles.behind, { transform: [{ rotate: '4deg' }] }]} />
          <Image source={{ uri: photo.image_url }} style={styles.photo} resizeMode="cover" />
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.chips}>
            <Text style={styles.chip}>{LEVELS.find((l) => l.key === level)?.label}</Text>
            <Text style={styles.chip}>⭐ +{base}</Text>
            {meta ? <Text style={styles.chip}>{meta.type === 'group' ? '👥 Group' : '👤 Solo'}</Text> : null}
          </View>
          <Text style={styles.challenge}>{meta?.challenge ?? 'Your challenge'}</Text>
          <Text style={styles.sub}>
            {event.title} · {longDate(event.startsAt)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>REACTIONS YOU GOT</Text>
          {total === 0 ? (
            <Text style={styles.text}>No reactions yet. They'll appear here when other people see your photo.</Text>
          ) : (
            <>
              {bouquet.length > 0 && <Text style={styles.bouquet}>{bouquet.join(' ')}</Text>}
              <View style={styles.chips}>
                {counts.length > 0 ? (
                  counts.map((r) => (
                    <Text key={r.api} style={styles.reactionChip}>
                      {r.emoji} {r.n}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.reactionChip}>❤️ {total}</Text>
                )}
              </View>
              <Text style={styles.text}>
                {total} {total === 1 ? 'reaction' : 'reactions'} · +{total * POINTS_PER_REACTION} points
              </Text>
            </>
          )}
        </View>

        <Text style={styles.total}>This photo is worth {eventPoints(event.id)} points in total.</Text>
      </ScrollView>
      <View style={styles.bottom}>
        <AppButton variant="secondary" label="Back" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  photoWrap: { height: 420, marginHorizontal: 6, marginTop: 6 },
  behind: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: r(28), backgroundColor: 'rgba(255,255,255,0.55)' },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: r(28), backgroundColor: colors.tint },
  back: { position: 'absolute', top: 12, left: 12, width: 44, height: 44, borderRadius: r(22), backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.glass, borderRadius: r(24), borderWidth: 1, borderColor: colors.glassBorder, padding: 16, gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: r(999), paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, fontWeight: '700', color: colors.text },
  challenge: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.text },
  sub: { fontSize: 16, color: colors.muted },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.muted },
  text: { fontSize: 16, lineHeight: 22, color: colors.muted },
  bouquet: { fontSize: 32, lineHeight: 44, letterSpacing: 4 },
  reactionChip: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: r(999), paddingHorizontal: 14, paddingVertical: 8, fontSize: 18, fontWeight: '700', color: colors.text },
  total: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12 },
});
