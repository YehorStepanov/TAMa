import { StyleSheet, Text, View } from 'react-native';
import { useEvents } from '@/context/EventsContext';
import { colors, r } from '@/theme';

// I tuoi punti veri e la serie di settimane di fila (solo informazione).
export function StatChips() {
  const { points, streak } = useEvents();
  return (
    <View style={styles.row}>
      <Text style={styles.chip}>🔥 {streak}</Text>
      <Text style={styles.chip}>⭐ {points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: r(999), paddingHorizontal: 14, paddingVertical: 8, fontSize: 17, fontWeight: '700', color: colors.text },
});
