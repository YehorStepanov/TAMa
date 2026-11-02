import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { EventCard } from '@/components/EventCard';
import { SmallButton } from '@/components/SmallButton';
import { StatusStrip } from '@/components/StatusStrip';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

function openMission(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

export default function TodayScreen() {
  const { myEvents, allEvents, removeFromMyPage } = useEvents();
  const today = myEvents.filter((e) => e.day === 'Today');
  const later = myEvents.filter((e) => e.day !== 'Today');

  const sections = [
    { title: 'Today', data: today },
    { title: 'Coming up', data: later },
  ].filter((s) => s.data.length > 0);

  function surpriseMe() {
    // Pesca tra gli eventi di oggi sulla mia pagina; se non ce ne sono, tra tutti quelli di oggi.
    const pool = today.length > 0 ? today : allEvents.filter((e) => e.day === 'Today');
    if (pool.length === 0) return;
    openMission(pool[Math.floor(Math.random() * pool.length)].id);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <StatusStrip />
        <Text style={styles.title}>My page</Text>
        <Text style={styles.subtitle}>{myEvents.length} events saved</Text>
        <SectionList
          sections={sections}
          keyExtractor={(e) => e.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
          renderItem={({ item }) => (
            <View style={{ marginBottom: sizes.gap }}>
              <EventCard
                event={item}
                showDay={item.day !== 'Today'}
                onPress={() => openMission(item.id)}
                right={
                  <SmallButton
                    tone="remove"
                    label="Remove"
                    accessibilityLabel={`Remove ${item.title} from my page`}
                    onPress={() => removeFromMyPage(item.id)}
                  />
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nothing on your page yet. Open Discover to add events.</Text>
          }
        />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.hint}>Can't decide? Let the app pick.</Text>
        <AppButton variant="accent" label="Surprise me" onPress={surpriseMe} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.muted, marginTop: 16, marginBottom: 8 },
  empty: { fontSize: 16, color: colors.muted, lineHeight: 23, marginTop: 16 },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
  hint: { textAlign: 'center', fontSize: 14, color: colors.muted },
});
