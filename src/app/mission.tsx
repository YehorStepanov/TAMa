import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AddressLink } from '@/components/AddressLink';
import { AppButton } from '@/components/AppButton';
import { FadeInView } from '@/components/FadeInView';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { useEvents } from '@/context/EventsContext';
import { DEFAULT_LEVEL, LEVELS, customFor, drawChallenge, pointsFor, type Challenge, type ChallengeType, type Level } from '@/data/challenges';
import { photoStatus, windowText } from '@/data/events';
import { longDate, monthShort, time24 } from '@/lib/format';
import { colors, sizes, r } from '@/theme';

const MEDIA_LABEL = { photo: 'Photo', video: 'Video', any: 'Photo or video' } as const;

// La scheda dell'evento: poster, informazioni e, sotto, la sfida da fare.
export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents, isCompleted, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const custom = customFor(event?.title ?? '');

  // Livello di partenza: medio. Singola o di gruppo: scegli tu (si parte da "solo").
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);
  const [type, setType] = useState<ChallengeType>('solo');
  const [challenge, setChallenge] = useState<Challenge>(() => drawChallenge(DEFAULT_LEVEL, 'solo', custom));

  if (!event) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={[styles.body, { flex: 1 }]}>
          <Text style={styles.title}>We can't find this event</Text>
        </View>
        <View style={styles.bottom}>
          <AppButton label="Back" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const status = photoStatus(event);
  const done = isCompleted(event.id);
  const saved = isOnMyPage(event.id);

  function changeLevel(next: Level) {
    setLevel(next);
    setChallenge(drawChallenge(next, type, custom));
  }
  function changeType(next: ChallengeType) {
    setType(next);
    setChallenge(drawChallenge(level, next, custom));
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <FadeInView index={0}>
          <View style={styles.poster}>
            {event.coverUrl ? (
              <Image source={{ uri: event.coverUrl }} style={styles.posterImage} resizeMode="cover" />
            ) : (
              <View style={[styles.posterImage, styles.posterEmpty]}>
                <Text style={{ fontSize: 80 }}>{event.emoji}</Text>
              </View>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
            <View style={styles.posterText}>
              <Text style={styles.place}>📍 {event.place}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.keywords}>
                {event.category} · {event.day}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from my events' : 'Add to my events'}
              onPress={() => (saved ? removeFromMyPage(event.id) : addToMyPage(event.id))}
              style={[styles.plus, saved && styles.plusOn]}>
              <Ionicons name={saved ? 'checkmark' : 'add'} size={28} color={saved ? colors.onPrimary : colors.primary} />
            </Pressable>
          </View>
        </FadeInView>

        <FadeInView index={1}>
          <View style={styles.rows}>
            <View style={styles.row}>
              <View style={styles.dateBox}>
                <Text style={styles.dateMonth}>{monthShort(event.startsAt)}</Text>
                <Text style={styles.dateDay}>{event.startsAt.getDate()}</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>{longDate(event.startsAt)}</Text>
                <Text style={styles.rowSub}>{time24(event.startsAt, event.endsAt)}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.dateBox}>
                <Ionicons name="location-outline" size={24} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{event.address}</Text>
                <AddressLink address={event.address} label="Open in Google Maps" />
              </View>
            </View>
          </View>
        </FadeInView>

        {event.description ? (
          <FadeInView index={2}>
            <Text style={styles.label}>ABOUT THE EVENT</Text>
            <Text style={styles.description}>{event.description}</Text>
          </FadeInView>
        ) : null}

        {!done && (
          <FadeInView index={3}>
            <Text style={[styles.label, { marginBottom: 8 }]}>YOUR CHALLENGE</Text>
            <Segmented value={level} onChange={changeLevel} options={LEVELS.map((l) => ({ key: l.key, label: l.label, sub: `${l.points} pts` }))} />
            <View style={{ height: 8 }} />
            <Segmented
              value={type}
              onChange={changeType}
              options={[
                { key: 'solo', label: '👤 Solo', sub: 'just me' },
                { key: 'group', label: '👥 Group', sub: 'with others' },
              ]}
            />
          </FadeInView>
        )}

        {status !== 'open' && !done && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {status === 'upcoming'
                ? `Come back when it starts! You can send your photo from ${event.day} at ${event.startClock}.`
                : `Too late for this one. Photos could be sent until ${windowText(event.photoWindowHours)} after the event ended.`}
            </Text>
          </View>
        )}

        {!done && (
          <FadeInView key={challenge.text} index={0} distance={24}>
            <View style={styles.challenge}>
              <View style={styles.chips}>
                <Text style={styles.chip}>{challenge.type === 'group' ? '👥 Group' : '👤 Solo'}</Text>
                <Text style={styles.chip}>{MEDIA_LABEL[challenge.media]}</Text>
                {challenge.custom && <Text style={[styles.chip, styles.chipCustom]}>Made for this event</Text>}
              </View>
              <Text style={styles.challengeText}>{challenge.text}</Text>
              <AppButton variant="secondary" label="Try another challenge" onPress={() => setChallenge((c) => drawChallenge(level, type, custom, c.text))} />
            </View>
          </FadeInView>
        )}

        {done && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>You've already sent your photo for this event. It's one per event.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        {done ? (
          <AppButton label="See the photos" onPress={() => router.push({ pathname: '/instants', params: { id: event.id } })} />
        ) : (
          <AppButton
            label="Take the challenge"
            disabled={status !== 'open'}
            onPress={() =>
              router.push({
                pathname: '/photo-proof',
                params: { id: event.id, challenge: challenge.text, type: challenge.type, level, media: challenge.media, points: String(pointsFor(level)) },
              })
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: sizes.margin, paddingTop: 10, paddingBottom: 14, gap: sizes.gap },
  // Il poster ha un'altezza fissa e il testo scritto sopra: l'immagine non occupa mai tutto lo schermo.
  poster: { height: 250, borderRadius: r(28), overflow: 'hidden', backgroundColor: colors.tint },
  posterImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  posterEmpty: { alignItems: 'center', justifyContent: 'center' },
  posterText: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingLeft: 16, paddingRight: 76, paddingVertical: 12, backgroundColor: 'rgba(14,20,28,0.6)' },
  back: { position: 'absolute', top: 12, left: 12, width: 48, height: 48, borderRadius: r(24), backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  plus: { position: 'absolute', right: 12, bottom: 14, width: 52, height: 52, borderRadius: r(18), backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  plusOn: { backgroundColor: colors.primary },
  place: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  keywords: { fontSize: 16, color: '#FFFFFF', marginTop: 2 },
  rows: { gap: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: { width: 52, height: 52, borderRadius: r(14), backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  dateMonth: { fontSize: 12, fontWeight: '700', color: colors.primary },
  dateDay: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: -2 },
  rowTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 16, color: colors.muted },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 0.8, color: colors.muted, marginBottom: 6, paddingHorizontal: 4 },
  description: { fontSize: 18, lineHeight: 26, color: colors.text, paddingHorizontal: 4 },
  notice: { backgroundColor: colors.sand, borderRadius: r(sizes.radius), padding: 14 },
  noticeText: { fontSize: 16, lineHeight: 22, fontWeight: '600', color: colors.sandText },
  challenge: { backgroundColor: colors.glass, borderRadius: r(sizes.radius), borderWidth: 1, borderColor: colors.glassBorder, padding: 16, gap: sizes.gap },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: r(999), paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, fontWeight: '700', color: colors.text },
  chipCustom: { backgroundColor: colors.sand, color: colors.sandText },
  challengeText: { fontSize: 24, fontWeight: '700', color: colors.text, lineHeight: 30 },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12 },
});
