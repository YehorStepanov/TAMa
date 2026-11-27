import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { FadeInView } from '@/components/FadeInView';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes, r } from '@/theme';

export default function RewardScreen() {
  const { id, points, challenge } = useLocalSearchParams<{ id: string; points?: string; challenge?: string }>();
  const { allEvents, streak } = useEvents();
  const event = allEvents.find((e) => e.id === id);

  // Il segno di spunta compare crescendo, con un rimbalzo molto leggero.
  const pop = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [pop, fade]);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.View style={[styles.check, { opacity: fade, transform: [{ scale: pop }] }]}>
          <Text style={styles.checkMark}>✓</Text>
        </Animated.View>
        <FadeInView index={2}>
          <Text style={styles.title}>Nice one!</Text>
        </FadeInView>
        <FadeInView index={3}>
          <Text style={styles.subtitle}>{event ? `Your photo for ${event.title} is in.` : 'Your photo is in.'}</Text>
        </FadeInView>
        <FadeInView index={4}>
          <View style={styles.card}>
            <Text style={styles.big}>+{points ?? 50}</Text>
            <Text style={styles.small}>points</Text>
          </View>
        </FadeInView>
        <FadeInView index={5}>
          {challenge ? <Text style={styles.note}>{challenge}</Text> : null}
          <Text style={[styles.note, { fontWeight: '700' }]}>🔥 {streak} {streak === 1 ? 'week' : 'weeks'} in a row</Text>
          <Text style={styles.note}>Now you can see everyone else's photos from this event in the Photos tab.</Text>
        </FadeInView>
      </View>
      <View style={styles.bottom}>
        <AppButton label="See the photos" onPress={() => router.replace('/photos')} />
        <AppButton variant="secondary" label="Done" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin, paddingTop: 56, alignItems: 'center', gap: sizes.gap },
  check: { width: 88, height: 88, borderRadius: r(44), backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 48, color: colors.onPrimary, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 16, color: colors.muted, textAlign: 'center' },
  card: {
    width: '100%',
    minWidth: 240,
    backgroundColor: colors.surface,
    borderRadius: r(sizes.radius),
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  big: { fontSize: 32, fontWeight: '700', color: colors.text },
  small: { fontSize: 14, color: colors.muted },
  note: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
});
