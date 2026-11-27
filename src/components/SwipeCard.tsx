import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, r } from '@/theme';
import type { EventItem } from '@/data/events';

const SCREEN_W = Dimensions.get('window').width;
const THRESHOLD = 110; // quanto trascinare per decidere

// Il poster dell'evento: foto di copertina a tutta carta (oppure l'emoji se non c'è la foto).
export function PosterFace({ event }: { event: EventItem }) {
  return event.coverUrl ? (
    <Image source={{ uri: event.coverUrl }} style={styles.fill} resizeMode="cover" />
  ) : (
    <View style={[styles.fill, styles.empty]}>
      <Text style={{ fontSize: 88 }}>{event.emoji}</Text>
    </View>
  );
}

export type SwipeCardHandle = { swipe: (dir: 'left' | 'right') => void };

type Props = {
  event: EventItem;
  onSwiped: (dir: 'left' | 'right') => void;
  onPress: () => void; // un tocco semplice apre la scheda dell'evento
};

// Carta da trascinare come su Tinder: a destra aggiunge l'evento, a sinistra lo salta.
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ event, onSwiped, onPress }, ref) {
  const pan = useRef(new Animated.ValueXY()).current;
  const pop = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 8, tension: 70, useNativeDriver: false }).start();
  }, [pop]);
  const onSwipedRef = useRef(onSwiped);
  onSwipedRef.current = onSwiped;

  function fling(dir: 'left' | 'right') {
    Animated.timing(pan, {
      toValue: { x: dir === 'right' ? SCREEN_W * 1.3 : -SCREEN_W * 1.3, y: 30 },
      duration: 260,
      useNativeDriver: false,
    }).start(() => onSwipedRef.current(dir));
  }
  useImperativeHandle(ref, () => ({ swipe: fling }));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > THRESHOLD) fling('right');
        else if (g.dx < -THRESHOLD) fling('left');
        else Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 7, useNativeDriver: false }).start();
      },
      onPanResponderTerminate: () => Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(),
    }),
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] });
  const addOpacity = pan.x.interpolate({ inputRange: [20, 110], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = pan.x.interpolate({ inputRange: [-110, -20], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      {...responder.panHandlers}
      accessibilityLabel={`${event.title}. Swipe right to add, left to skip.`}
      style={[styles.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }, { scale: pop }] }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${event.title}`} onPress={onPress} style={styles.fill}>
        <PosterFace event={event} />
        <View style={styles.caption}>
          <Text style={styles.place}>📍 {event.place}</Text>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.keywords}>{event.category} · {event.day} · {event.time}</Text>
        </View>
      </Pressable>
      <Animated.Text pointerEvents="none" style={[styles.stamp, styles.stampAdd, { opacity: addOpacity }]}>ADD</Animated.Text>
      <Animated.Text pointerEvents="none" style={[styles.stamp, styles.stampSkip, { opacity: skipOpacity }]}>SKIP</Animated.Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: r(28),
    overflow: 'hidden',
    backgroundColor: colors.tint,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: 'rgba(14,20,28,0.6)' },
  place: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  title: { fontSize: 30, fontWeight: '700', color: '#FFFFFF', lineHeight: 36 },
  keywords: { fontSize: 17, color: '#FFFFFF', marginTop: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint },
  stamp: {
    position: 'absolute',
    top: 28,
    fontSize: 32,
    fontWeight: '700',
    borderWidth: 4,
    borderRadius: r(12),
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    overflow: 'hidden',
  },
  stampAdd: { left: 24, color: colors.success, borderColor: colors.success, transform: [{ rotate: '-12deg' }] },
  stampSkip: { right: 24, color: colors.muted, borderColor: colors.muted, transform: [{ rotate: '12deg' }] },
});
