import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { colors, r } from '@/theme';

// Un ricordo: la tua foto, in grande, con solo il titolo dell'evento. Toccandola si vedono sfida e reazioni.
export function MemoryCard({ event, onPress }: { event: EventItem; onPress: () => void }) {
  const { photoFor } = useEvents();
  const photo = photoFor(event.id);
  if (!photo) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open your photo from ${event.title}`} onPress={onPress} style={styles.card}>
      <Image source={{ uri: photo.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.bar}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 230, borderRadius: r(26), overflow: 'hidden', backgroundColor: colors.tint },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(14,20,28,0.5)' },
  title: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
