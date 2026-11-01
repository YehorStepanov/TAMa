import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/context/EventsContext';
import { randomChallenge } from '@/data/challenges';
import { colors, sizes } from '@/theme';

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const [challengeOn, setChallengeOn] = useState(true);
  const [challenge, setChallenge] = useState(() => randomChallenge());

  if (!event) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.body}>
          <Text style={styles.title}>Event not found</Text>
        </View>
        <View style={styles.bottom}>
          <AppButton label="Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <Text style={styles.label}>YOUR MISSION</Text>
        <EventCard event={event} />

        <View style={styles.challenge}>
          <View style={styles.challengeTop}>
            <Text style={styles.challengeTitle}>Random challenge</Text>
            <Switch value={challengeOn} onValueChange={setChallengeOn} trackColor={{ true: colors.success }} />
          </View>
          {challengeOn && (
            <>
              <Text style={styles.challengeText}>{challenge}</Text>
              <AppButton
                variant="secondary"
                label="Draw another challenge"
                onPress={() => setChallenge((c) => randomChallenge(c))}
              />
            </>
          )}
        </View>

        <Text style={styles.points}>{challengeOn ? '+50 pts, +20 with the challenge' : '+50 pts'}</Text>
      </View>

      <View style={styles.bottom}>
        <AppButton
          label="Accept mission"
          onPress={() => Alert.alert('Next step', 'The photo proof screen comes next.')}
        />
        <AppButton variant="secondary" label="Pick another event" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin, paddingTop: 24, gap: sizes.gap },
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
  challengeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  challengeTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  challengeText: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 28 },
  points: { fontSize: 16, color: colors.muted },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
});
