import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AddressLink } from '@/components/AddressLink';
import { colors, sizes } from '@/theme';
import type { EventItem } from '@/data/events';

type Props = {
  event: EventItem;
  showDay?: boolean;
  note?: string; // piccola etichetta, per esempio "On my page"
  showAddress?: boolean; // indirizzo cliccabile che apre Google Maps
  onPress?: () => void; // se presente, tutta la card è cliccabile
  right?: ReactNode; // per esempio il pulsante Add / Remove
};

export function EventCard({ event, showDay = false, note, showAddress = false, onPress, right }: Props) {
  const when = showDay ? `${event.day} · ${event.time}` : event.time;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Open ${event.title}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.thumb}>
        <Text style={styles.thumbEmoji}>{event.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.line}>
          {when} · {event.place}
        </Text>
        {showAddress ? <AddressLink address={event.address} /> : null}
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 80,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
  },
  thumb: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 28 },
  info: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  line: { fontSize: 14, color: colors.muted, marginTop: 2 },
  note: { fontSize: 13, fontWeight: '700', color: colors.successText, marginTop: 4 },
});
