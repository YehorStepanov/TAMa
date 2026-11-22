import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
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
};

// Carta da trascinare come su Tinder: a destra aggiunge l'evento, a sinistra lo salta.
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ event, onSwiped }, ref) {
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
      <PosterFace event={event} />
      <Animated.Text style={[styles.stamp, styles.stampAdd, { opacity: addOpacity }]}>ADD</Animated.Text>
      <Animated.Text style={[styles.stamp, styles.stampSkip, { opacity: skipOpacity }]}>SKIP</Animated.Text>
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
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.tint,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint },
  stamp: {
    position: 'absolute',
    top: 28,
    fontSize: 32,
    fontWeight: '700',
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    overflow: 'hidden',
  },
  stampAdd: { left: 24, color: colors.success, borderColor: colors.success, transform: [{ rotate: '-12deg' }] },
  stampSkip: { right: 24, color: colors.muted, borderColor: colors.muted, transform: [{ rotate: '12deg' }] },
});
