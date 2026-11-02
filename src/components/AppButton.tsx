import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
};

// primary / accent = 56 px (azione principale), secondary = 48 px (azione secondaria).
export function AppButton({ label, onPress, variant = 'primary' }: Props) {
  const primary = variant !== 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        variant === 'accent' && styles.accent,
        pressed && { opacity: 0.85 },
      ]}>
      <Text style={[styles.text, primary ? styles.textPrimary : styles.textSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  primary: { height: sizes.buttonPrimary, borderRadius: 16, backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  secondary: {
    height: sizes.buttonSecondary,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  text: { fontSize: 17 },
  textPrimary: { color: '#FFFFFF', fontWeight: '700' },
  textSecondary: { color: colors.text, fontWeight: '500', fontSize: 16 },
});
