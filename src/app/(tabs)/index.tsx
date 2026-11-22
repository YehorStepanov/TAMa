import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { ServerStatus } from '@/components/ServerStatus';
import { SmallButton } from '@/components/SmallButton';
import { StatusStrip } from '@/components/StatusStrip';
import { useEvents } from '@/context/EventsContext';
import { photoStatus } from '@/data/events';
import { colors, sizes } from '@/theme';

function openMission(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

export default function TodayScreen() {
  const { myEvents, removeFromMyPage, isCompleted, allEvents, loading, error } = useEvents();
  const now = Date.now();
  // Eventi finiti ieri (o prima): restano 2 giorni, e per un giorno si può ancora inviare la foto.
  const earlier = myEvents.filter((e) => e.endsAt.getTime() < now && e.day !== 'Today');
  const today = myEvents.filter((e) => e.day === 'Today');
  const later = myEvents.filter((e) => e.day !== 'Today' && e.endsAt.getTime() >= now);

  const sections = [
    { title: 'Today', data: today },
    { title: 'Coming up', data: later },
    { title: 'Earlier', data: earlier },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <StatusStrip />
        <Text style={styles.title}>My page</Text>
        <Text style={styles.subtitle}>{myEvents.length} events saved · tap one to see your challenge</Text>
        <SectionList
          sections={sections}
          keyExtractor={(e) => e.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
          renderItem={({ item, index }) => (
            <FadeInView index={index}>
            <View style={{ marginBottom: sizes.gap }}>
              <EventCard
                event={item}
                showDay={item.day !== 'Today'}
                showAddress
                note={
                  isCompleted(item.id)
                    ? 'Done ✓ · tap to see the photos'
                    : item.endsAt.getTime() < now && photoStatus(item) === 'open'
                      ? 'Ended · you can still send your photo'
                      : undefined
                }
                onPress={() =>
                  isCompleted(item.id)
                    ? router.push({ pathname: '/instants', params: { id: item.id } })
                    : openMission(item.id)
                }
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
            </FadeInView>
          )}
          ListEmptyComponent={
            allEvents.length === 0 && (loading || error) ? (
              <ServerStatus variant="list" />
            ) : (
              <Text style={styles.empty}>Nothing on your page yet. Open Discover and add events.</Text>
            )
          }
        />
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
});
