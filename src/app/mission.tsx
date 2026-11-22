import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { Segmented } from '@/components/Segmented';
import { useEvents } from '@/context/EventsContext';
import {
  customFor,
  DEFAULT_LEVEL,
  LEVELS,
  drawChallenge,
  pointsFor,
  type Challenge,
  type Level,
} from '@/data/challenges';
import { colors, sizes } from '@/theme';

const MEDIA_LABEL = { photo: 'Photo', video: 'Video', any: 'Photo or video' } as const;

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents, isCompleted } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const custom = customFor(event?.title ?? '');

  // Livello di partenza: medio. Si cambia qui, quando si sceglie l'evento.
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);
  const [challenge, setChallenge] = useState<Challenge>(() => drawChallenge(DEFAULT_LEVEL, custom));
  const points = pointsFor(level);

  function changeLevel(next: Level) {
    setLevel(next);
    setChallenge(drawChallenge(next, custom));
  }

  // Una sfida per evento: se l'ho già completata non si può rifare.
  if (!event || isCompleted(event.id)) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={[styles.body, { flex: 1 }]}>
          <Text style={styles.title}>{event ? 'Challenge already completed' : 'Event not found'}</Text>
          {event && <Text style={styles.points}>You already sent your photo or video for {event.title}. One per event.</Text>}
        </View>
        <View style={styles.bottom}>
          <AppButton label="Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <FadeInView index={0}>
        <Text style={[styles.label, { marginBottom: 8 }]}>THE EVENT</Text>
        <View style={styles.info}>
          <EventCard event={event} showDay showAddress />
          <Text style={styles.tagLine}>{event.category}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        </FadeInView>

        <FadeInView index={1}>
        <Text style={[styles.label, { marginBottom: 8 }]}>YOUR CHALLENGE</Text>
        <Segmented
          value={level}
          onChange={changeLevel}
          options={LEVELS.map((l) => ({ key: l.key, label: l.label, sub: `${l.points} pts` }))}
        />
        </FadeInView>

        <FadeInView key={challenge.text} index={2} distance={24}>
        <View style={styles.challenge}>
          <View style={styles.chips}>
            <Text style={styles.chip}>{challenge.type === 'group' ? '👥 Group' : '👤 Solo'}</Text>
            <Text style={styles.chip}>{MEDIA_LABEL[challenge.media]}</Text>
            {challenge.custom && <Text style={[styles.chip, styles.chipCustom]}>Made for this event</Text>}
          </View>
          <Text style={styles.challengeText}>{challenge.text}</Text>
          <AppButton
            variant="secondary"
            label="Draw another challenge"
            onPress={() => setChallenge((c) => drawChallenge(level, custom, c.text))}
          />
        </View>
        </FadeInView>

        <FadeInView index={3}>
        <Text style={styles.points}>+{points} points when you send it</Text>
        </FadeInView>
      </ScrollView>

      <View style={styles.bottom}>
        <AppButton
          label="Accept challenge"
          onPress={() =>
            router.push({
              pathname: '/photo-proof',
              params: {
                id: event.id,
                challenge: challenge.text,
                type: challenge.type,
                level,
                points: String(points),
                media: challenge.media,
              },
            })
          }
        />
        <AppButton variant="secondary" label="Back" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: sizes.margin, paddingTop: 24, paddingBottom: 12, gap: sizes.gap },
  info: {
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  tagLine: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.primary, paddingHorizontal: 4 },
  description: { fontSize: 16, lineHeight: 23, color: colors.text, paddingHorizontal: 4, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.muted },
  challenge: {
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: sizes.gap,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    overflow: 'hidden',
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chipCustom: { backgroundColor: colors.sand, color: colors.sandText },
  challengeText: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 28 },
  points: { fontSize: 16, color: colors.muted },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
});
