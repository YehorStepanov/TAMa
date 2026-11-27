import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { useEvents } from '@/context/EventsContext';
import { colors, r } from '@/theme';

// All'apertura dell'app: se un evento che hai salvato è in corso, te lo ricorda.
export function OngoingSheet() {
  const { allEvents, isOnMyPage, isCompleted, loading } = useEvents();
  const [seen, setSeen] = useState<string[]>([]);

  const now = Date.now();
  const ongoing = allEvents.find(
    (e) => isOnMyPage(e.id) && e.startsAt.getTime() <= now && now <= e.endsAt.getTime() && !isCompleted(e.id) && !seen.includes(e.id),
  );
  const visible = !!ongoing && !loading;

  function close() {
    if (ongoing) setSeen((s) => [...s, ongoing.id]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.wrap}>
        <Pressable style={{ flex: 1 }} onPress={close} />
        {ongoing && (
          <View style={styles.sheet}>
            <Text style={styles.badge}>● HAPPENING NOW</Text>
            <Text style={styles.title}>
              {ongoing.emoji} {ongoing.title}
            </Text>
            <Text style={styles.text}>
              {ongoing.place} · until {ongoing.endClock}. Ready for your challenge?
            </Text>
            <AppButton
              label="Take the challenge"
              onPress={() => {
                const id = ongoing.id;
                close();
                router.push({ pathname: '/mission', params: { id } });
              }}
            />
            <AppButton variant="secondary" label="Maybe later" onPress={close} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: r(28), borderTopRightRadius: r(28), padding: 20, gap: 12 },
  badge: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.accent },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  text: { fontSize: 16, lineHeight: 23, color: colors.muted },
});
