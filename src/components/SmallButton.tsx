import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes, r } from '@/theme';

type Props = { label: string; onPress: () => void; accessibilityLabel?: string; tone?: 'add' | 'remove' };

// Pulsante piccolo dentro le card: alto 48 px (area minima di tocco).
export function SmallButton({ label, onPress, accessibilityLabel, tone = 'add' }: Props) {
  const add = tone === 'add';
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) => Animated.timing(scale, { toValue: to, duration: 90, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        onPressIn={() => press(0.95)}
        onPressOut={() => press(1)}
        style={[styles.btn, add ? styles.add : styles.remove]}>
        <Text style={[styles.text, { color: add ? colors.primary : colors.muted }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: sizes.minTouch,
    minWidth: 84,
    paddingHorizontal: 14,
    borderRadius: r(999),
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: { borderColor: colors.primary },
  remove: { borderColor: colors.outline },
  text: { fontSize: 15, fontWeight: '700' },
});
