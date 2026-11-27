import { StyleSheet, Text, View } from 'react-native';
import { useEvents } from '@/context/EventsContext';
import { colors } from '@/theme';

// Barra in alto: i tuoi punti (solo informazione, niente di cliccabile).
export function StatusStrip() {
  const { points } = useEvents();
  return (
    <View style={styles.row}>
      <Text style={styles.chip}>⭐ {points} points</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, flexDirection: 'row', alignItems: 'center' },
  chip: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
