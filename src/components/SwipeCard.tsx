import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { AddressLink } from '@/components/AddressLink';
import { colors } from '@/theme';
import type { EventItem } from '@/data/events';

const SCREEN_W = Dimensions.get('window').width;
const THRESHOLD = 110; // quanto devo trascinare per decidere

// Il contenuto della carta (usato anche per la carta che spunta da dietro).
export function EventFace({ event }: { event: EventItem }) {
  return (
    <View style={styles.face}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>{event.emoji}</Text>
        <Text style={styles.tag}>{event.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.when}>
          {event.day} · {event.time}
        </Text>
        <Text style={styles.place}>{event.place}</Text>
        <AddressLink address={event.address} />
      </View>
    </View>
  );
}

export type SwipeCardHandle = { swipe: (dir: 'left' | 'right') => void };

type Props = {
  event: EventItem;
  onSwiped: (dir: 'left' | 'right') => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ event, onSwiped }, ref) {
  const pan = useRef(new Animated.ValueXY()).current;
  const onSwipedRef = useRef(onSwiped);
  onSwipedRef.current = onSwiped;

  function fling(dir: 'left' | 'right') {
    Animated.timing(pan, {
      toValue: { x: dir === 'right' ? SCREEN_W * 1.3 : -SCREEN_W * 1.3, y: 40 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => onSwipedRef.current(dir));
  }
  useImperativeHandle(ref, () => ({ swipe: fling }));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) return; // un tocco semplice non fa nulla
        if (g.dx > THRESHOLD) fling('right');
        else if (g.dx < -THRESHOLD) fling('left');
        else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }),
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-10deg', '0deg', '10deg'] });
  const addOpacity = pan.x.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = pan.x.interpolate({ inputRange: [-100, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      {...responder.panHandlers}
      accessibilityLabel={`${event.title}. Swipe right to add, left to skip.`}
      style={[styles.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}>
      <EventFace event={event} />
      <Animated.Text style={[styles.stamp, styles.stampAdd, { opacity: addOpacity }]}>ADD</Animated.Text>
      <Animated.Text style={[styles.stamp, styles.stampSkip, { opacity: skipOpacity }]}>SKIP</Animated.Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
  },
  face: { flex: 1 },
  hero: { height: '48%', backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 88 },
  tag: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  body: { padding: 20, gap: 4 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  when: { fontSize: 16, fontWeight: '500', color: colors.text, marginTop: 4 },
  place: { fontSize: 16, color: colors.muted },
  stamp: {
    position: 'absolute',
    top: 26,
    fontSize: 30,
    fontWeight: '700',
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  stampAdd: { left: 24, color: colors.success, borderColor: colors.success, transform: [{ rotate: '-12deg' }] },
  stampSkip: { right: 24, color: colors.muted, borderColor: colors.muted, transform: [{ rotate: '12deg' }] },
});
