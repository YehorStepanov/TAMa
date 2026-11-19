import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

// Pulsanti a pillola: primary = 56 px (azione principale), secondary = 48 px (azione secondaria).
export function AppButton({ label, onPress, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.base, primary ? styles.primary : styles.secondary, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.text, primary ? styles.textPrimary : styles.textSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', width: '100%', borderRadius: 999 },
  primary: { height: sizes.buttonPrimary, backgroundColor: colors.primary },
  secondary: { height: sizes.buttonSecondary, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.outline },
  text: { fontSize: 16 },
  textPrimary: { color: colors.onPrimary, fontWeight: '700' },
  textSecondary: { color: colors.text, fontWeight: '600' },
});
