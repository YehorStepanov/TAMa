import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes, r } from '@/theme';

// Il pulsante tondo dentro una card (aggiungi / togli): piccolo, ma alto 48 px, e non ruba spazio al testo.
export function CardAction({ tone, label, onPress }: { tone: 'add' | 'remove'; label: string; onPress: () => void }) {
  const add = tone === 'add';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} style={[styles.btn, add ? styles.add : styles.remove]}>
      <Ionicons name={add ? 'add' : 'close'} size={26} color={add ? colors.primary : colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: sizes.minTouch, height: sizes.minTouch, borderRadius: r(sizes.minTouch / 2), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  add: { borderColor: colors.primary, backgroundColor: 'rgba(75,95,201,0.16)' },
  remove: { borderColor: colors.outline, backgroundColor: 'rgba(255,255,255,0.6)' },
});
