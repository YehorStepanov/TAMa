import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { SmallButton } from '@/components/SmallButton';
import { StatusStrip } from '@/components/StatusStrip';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

function openMission(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

export default function TodayScreen() {
  const { myEvents, removeFromMyPage, isCompleted } = useEvents();
  const today = myEvents.filter((e) => e.day === 'Today');
  const later = myEvents.filter((e) => e.day !== 'Today');

  const sections = [
    { title: 'Today', data: today },
    { title: 'Coming up', data: later },
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
                note={isCompleted(item.id) ? 'Done ✓ · tap to see the photos' : undefined}
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
            <Text style={styles.empty}>Nothing on your page yet. Open Discover to add events.</Text>
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
