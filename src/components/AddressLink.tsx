import { Pressable, StyleSheet, Text } from 'react-native';
import { openDirections } from '@/lib/maps';
import { colors } from '@/theme';

// L'indirizzo è un link: un tocco e si apre direttamente Google Maps con le indicazioni.
export function AddressLink({ address, label }: { address: string; label?: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${address} in Google Maps`}
      hitSlop={{ top: 6, bottom: 6 }}
      onPress={() => openDirections(address)}
      style={styles.row}>
      <Text style={styles.text}>📍 {label ?? address}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, alignSelf: 'flex-start' },
  text: { fontSize: 15, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' },
});
