import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

// Barra in alto: solo informazioni, niente di cliccabile (zona difficile da raggiungere col pollice).
export function StatusStrip() {
  return (
    <View style={styles.row}>
      <Text style={[styles.chip, { color: '#8A5A2B' }]}>3 week streak</Text>
      <Text style={styles.chip}>120 pts</Text>
      <Text style={[styles.chip, { marginLeft: 'auto' }]}>Lv 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 8 },
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
