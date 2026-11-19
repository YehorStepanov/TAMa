import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Option<T extends string> = { key: T; label: string; sub?: string };

// Selettore a più scelte (per esempio la difficoltà). Ogni scelta è alta almeno 56 px.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={[styles.item, active && styles.itemActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
            {o.sub ? <Text style={[styles.sub, active && styles.labelActive]}>{o.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: 999, padding: 4 },
  item: { flex: 1, minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: colors.surface },
  label: { fontSize: 16, fontWeight: '600', color: colors.muted },
  sub: { fontSize: 13, color: colors.muted },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
