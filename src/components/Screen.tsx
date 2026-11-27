import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '@/theme';

// Lo sfondo sfumato di tutta l'app.
export function Screen({ children, edges = ['top'], style }: { children: ReactNode; edges?: Edge[]; tabs?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={colors.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={edges} style={[styles.root, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

// Lo spazio da lasciare in fondo alle liste scorrevoli.
export function useTabSpace(): number {
  return 16;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
