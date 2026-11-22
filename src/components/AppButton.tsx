import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

// Pulsanti a pillola: primary = 56 px (azione principale), secondary = 48 px (azione secondaria).
export function AppButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const primary = variant === 'primary';
  // Quando premi, il pulsante si rimpicciolisce appena: il tocco si vede ma senza effetti vistosi.
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) => Animated.timing(scale, { toValue: to, duration: 90, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ width: '100%', opacity: disabled ? 0.4 : 1, transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        style={[styles.base, primary ? styles.primary : styles.secondary]}>
        <Text style={[styles.text, primary ? styles.textPrimary : styles.textSecondary]}>{label}</Text>
      </Pressable>
    </Animated.View>
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
