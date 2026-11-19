import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvents } from '@/context/EventsContext';
import { instantsForEvent, type MediaSource } from '@/data/photos';
import { REACTION_EMOJIS } from '@/data/reactions';
import { colors } from '@/theme';

const SCREEN_W = Dimensions.get('window').width;
const THRESHOLD = 90; // quanto trascinare per cambiare foto

type Burst = { id: number; emoji: string; x: number };

// Emoji che sale e svanisce sopra la foto.
function FloatingEmoji({ emoji, x, onDone }: { emoji: string; x: number; onDone: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 1300, useNativeDriver: true }).start(onDone);
  }, [progress, onDone]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 24,
        left: x,
        fontSize: 34,
        opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -260] }) }],
      }}>
      {emoji}
    </Animated.Text>
  );
}

// Un video che parte da solo e si ripete.
function VideoSlide({ source }: { source: MediaSource }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.play();
  });
  return <VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="contain" nativeControls />;
}

export default function InstantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  // Solo le foto degli altri: non posso reagire alla mia.
  const instants = instantsForEvent(id ?? '');

  const [index, setIndex] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);
  const last = instants.length - 1;

  // La foto segue il dito (pan), si inclina, e la nuova entra con un piccolo "pop" (enter).
  const pan = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);
  const indexRef = useRef(0);
  indexRef.current = index;
  const lastRef = useRef(last);
  lastRef.current = last;

  function fling(delta: 1 | -1) {
    const target = indexRef.current + delta;
    if (busy.current || target < 0 || target > lastRef.current) {
      Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
      return;
    }
    busy.current = true;
    Animated.timing(pan, { toValue: delta === 1 ? -SCREEN_W * 1.2 : SCREEN_W * 1.2, duration: 200, useNativeDriver: false }).start(() => {
      setIndex(target);
      pan.setValue(0);
      enter.setValue(0.9);
      Animated.spring(enter, { toValue: 1, friction: 6, useNativeDriver: false }).start();
      busy.current = false;
    });
  }
  const flingRef = useRef(fling);
  flingRef.current = fling;

  const swipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const atEdge = (g.dx < 0 && indexRef.current >= lastRef.current) || (g.dx > 0 && indexRef.current <= 0);
        pan.setValue(atEdge ? g.dx * 0.25 : g.dx); // ai bordi la foto "resiste"
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -THRESHOLD) flingRef.current(1);
        else if (g.dx > THRESHOLD) flingRef.current(-1);
        else Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
      },
      onPanResponderTerminate: () => Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start(),
    }),
  ).current;

  function react(emoji: string) {
    const fresh: Burst[] = [0, 1, 2].map(() => ({ id: burstId.current++, emoji, x: 30 + Math.random() * 220 }));
    setBursts((b) => [...b, ...fresh]);
  }

  const current = instants[index];
  const behind = [instants[index + 2], instants[index + 1]].filter(Boolean);
  const rotations = ['6deg', '-7deg'];
  const rotate = pan.interpolate({ inputRange: [-SCREEN_W, 0, SCREEN_W], outputRange: ['-14deg', '0deg', '14deg'] });
  const dim = pan.interpolate({ inputRange: [-SCREEN_W, 0, SCREEN_W], outputRange: [0.4, 1, 0.4] });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>{event?.title ?? 'Instants'}</Text>
          <Text style={styles.sub}>
            {instants.length > 0 ? `${index + 1} of ${instants.length} · ` : ''}photos stay for 24 hours
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.stage} {...swipe.panHandlers}>
        {current ? (
          <>
            {behind.map((it, i) => (
              <View key={it.key} style={[styles.photo, styles.behind, { transform: [{ rotate: rotations[i] }] }]} />
            ))}
            <Animated.View
              style={[styles.photo, { opacity: dim, transform: [{ translateX: pan }, { rotate }, { scale: enter }] }]}>
              <View style={[styles.fill, styles.frame]}>
                {current.kind === 'video' ? (
                  <VideoSlide key={current.key} source={current.source} />
                ) : (
                  <Image source={current.source as number} resizeMode="contain" style={{ width: '100%', height: '100%' }} accessibilityLabel="Instant" />
                )}
              </View>
              <Text style={styles.challengeTag}>
                {current.type === 'group' ? '👥' : '👤'} {current.challenge}
              </Text>
            </Animated.View>
          </>
        ) : (
          <View style={[styles.photo, styles.noPhotos]}>
            <Text style={styles.noPhotosText}>No instants yet</Text>
          </View>
        )}
        {bursts.map((b) => (
          <FloatingEmoji key={b.id} emoji={b.emoji} x={b.x} onDone={() => setBursts((all) => all.filter((x) => x.id !== b.id))} />
        ))}
      </View>

      <View style={styles.reactions}>
        {REACTION_EMOJIS.map((e) => (
          <Pressable key={e} accessibilityRole="button" accessibilityLabel={`React ${e}`} onPress={() => react(e)} style={styles.reactBtn}>
            <Text style={styles.reactText}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.nav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous photo" disabled={index === 0} onPress={() => fling(-1)} style={[styles.pill, index === 0 && styles.pillOff]}>
          <Text style={styles.pillText}>‹ Back</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Next photo" disabled={index >= last} onPress={() => fling(1)} style={[styles.pill, index >= last && styles.pillOff]}>
          <Text style={styles.pillText}>Next ›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night, paddingHorizontal: 16 },
  top: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 26, color: colors.onPrimary },
  title: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  stage: { flex: 1, marginVertical: 12, marginHorizontal: 8 },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 30 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  behind: { backgroundColor: 'rgba(255,255,255,0.14)' },
  // La foto si vede intera (non ingrandita): resizeMode contain dentro una cornice scura.
  frame: { overflow: 'hidden', borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.35)' },
  challengeTag: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  noPhotos: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  noPhotosText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  reactions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  reactBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  reactText: { fontSize: 28 },
  nav: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 },
  pill: { flex: 1, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  pillOff: { opacity: 0.4 },
  pillText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },
});
