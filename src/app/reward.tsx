import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

export default function RewardScreen() {
  const { id, challenge } = useLocalSearchParams<{ id: string; challenge?: string }>();
  const { allEvents } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const points = challenge ? 70 : 50; // 50 per la missione, +20 con la sfida

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Mission complete</Text>
        <Text style={styles.subtitle}>{event ? `Photo sent for ${event.title}.` : 'Photo sent.'}</Text>
        <View style={styles.card}>
          <Text style={styles.big}>+{points}</Text>
          <Text style={styles.small}>points</Text>
        </View>
        <Text style={styles.note}>You can now see the photos from this event in the Photo wall.</Text>
      </View>
      <View style={styles.bottom}>
        <AppButton label="See photo wall" onPress={() => router.replace('/photos')} />
        <AppButton variant="secondary" label="Done" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin, paddingTop: 56, alignItems: 'center', gap: sizes.gap },
  check: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 48, color: '#FFFFFF', fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 16, color: colors.muted, textAlign: 'center' },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
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
