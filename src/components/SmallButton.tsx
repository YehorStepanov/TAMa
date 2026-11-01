import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes } from '@/theme';

type Props = { label: string; onPress: () => void; accessibilityLabel?: string; tone?: 'add' | 'remove' };

// Pulsante piccolo dentro le card: alto 48 px (area minima di tocco).
export function SmallButton({ label, onPress, accessibilityLabel, tone = 'add' }: Props) {
  const add = tone === 'add';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[styles.btn, add ? styles.add : styles.remove]}>
      <Text style={[styles.text, { color: add ? colors.primary : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: sizes.minTouch,
    minWidth: 84,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: { borderColor: colors.primary },
  remove: { borderColor: colors.outline },
  text: { fontSize: 15, fontWeight: '700' },
});
