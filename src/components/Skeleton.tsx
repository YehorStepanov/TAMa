import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import { colors, sizes } from '@/theme';

// Segnaposto di caricamento ("skeleton"): ha la forma del contenuto che sta per arrivare, con un'onda
// lenta da sinistra verso destra (secondo le slide: l'onda piace più dell'effetto pulsante, e lenta meglio che veloce).
export function SkeletonBox({ style }: { style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <View style={[styles.box, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Animated.View
          style={[styles.band, { width: width * 0.8, transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.8, width] }) }] }]}>
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </View>
  );
}

const SCREEN_W = Dimensions.get('window').width;

// Come una carta di Discover: grande poster + luogo, titolo e parole chiave.
export function PosterSkeleton() {
  return (
    <View style={{ gap: 12, paddingHorizontal: sizes.margin }}>
      <SkeletonBox style={{ width: '100%', height: Math.round((SCREEN_W - sizes.margin * 2) * 1.15), borderRadius: 28 }} />
      <SkeletonBox style={{ width: '40%', height: 14, borderRadius: 7 }} />
      <SkeletonBox style={{ width: '75%', height: 24, borderRadius: 8 }} />
      <SkeletonBox style={{ width: '55%', height: 14, borderRadius: 7 }} />
    </View>
  );
}

// Come una lista di card: miniatura + due righe.
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: sizes.gap, paddingTop: 12 }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          <SkeletonBox style={{ width: 56, height: 56, borderRadius: 16 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox style={{ width: '70%', height: 18, borderRadius: 8 }} />
            <SkeletonBox style={{ width: '50%', height: 12, borderRadius: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.border, overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    minHeight: 80,
  },
});
