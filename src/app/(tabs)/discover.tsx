import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '@/components/EventCard';
import { SmallButton } from '@/components/SmallButton';
import { StatusStrip } from '@/components/StatusStrip';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

export default function DiscoverScreen() {
  const { allEvents, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <StatusStrip />
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Events added by others. Add the ones you like.</Text>
        <FlatList
          data={allEvents}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ gap: sizes.gap, paddingTop: 12, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const added = isOnMyPage(item.id);
            return (
              <EventCard
                event={item}
                showDay
                note={added ? 'On my page' : undefined}
                right={
                  added ? (
                    <SmallButton
                      tone="remove"
                      label="Remove"
                      accessibilityLabel={`Remove ${item.title} from my page`}
                      onPress={() => removeFromMyPage(item.id)}
                    />
                  ) : (
                    <SmallButton
                      label="Add"
                      accessibilityLabel={`Add ${item.title} to my page`}
                      onPress={() => addToMyPage(item.id)}
                    />
                  )
                }
              />
            );
          }}
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
});
