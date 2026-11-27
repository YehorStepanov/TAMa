import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Marquee } from '@/components/Marquee';
import { colors, r } from '@/theme';
import type { EventItem } from '@/data/events';

type Props = {
  event: EventItem;
  showDay?: boolean;
  note?: string; // piccola etichetta, per esempio "Done ✓"
  showAddress?: boolean; // non più usato: l'indirizzo non è più un link nelle card (si toccava per sbaglio)
  onPress?: () => void; // se presente, tutta la card è cliccabile
  right?: ReactNode; // per esempio il pulsante tondo Add / Remove: sta a destra, al centro
};

// La card di un evento: miniatura, testi e azione sulla stessa riga, senza spazi vuoti.
export function EventCard({ event, showDay = false, note, onPress, right }: Props) {
  const when = showDay ? `${event.day} · ${event.time}` : event.time;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Open ${event.title}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.thumb}>
        {event.coverUrl ? <Image source={{ uri: event.coverUrl }} style={styles.thumbImage} resizeMode="cover" /> : <Text style={styles.thumbEmoji}>{event.emoji}</Text>}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={{ marginTop: 2 }}>
          <Marquee text={when} style={styles.line} height={22} />
        </View>
        <View style={{ marginTop: 2 }}>
          <Marquee text={`📍 ${event.place}`} style={styles.line} height={22} />
        </View>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: r(24),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: { width: 104, height: 104, borderRadius: r(18), backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 44 },
  info: { flex: 1 },
  title: { fontSize: 19, fontWeight: '700', color: colors.text, lineHeight: 24 },
  line: { fontSize: 15, lineHeight: 22, color: colors.muted },
  note: { fontSize: 14, fontWeight: '700', color: colors.successText, marginTop: 4 },
  right: { paddingRight: 4 },
});
