import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { SkeletonBox } from '@/components/Skeleton';
import { useEvents } from '@/context/EventsContext';
import { fromApiPhoto, type Instant } from '@/data/photos';
import { REACTIONS } from '@/data/reactions';
import { getEventPhotos } from '@/lib/api';
import { colors, r } from '@/theme';

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

export default function InstantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allEvents, myReaction, react: setReaction } = useEvents();
  const event = allEvents.find((e) => e.id === id);

  // Le foto degli altri partecipanti (la mia non c'è: non posso reagire alla mia).
  const [instants, setInstants] = useState<Instant[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  useEffect(() => {
    getEventPhotos(id ?? '')
      .then((list) => setInstants(list.map(fromApiPhoto)))
      .catch((e) => {
        setProblem(e instanceof Error ? e.message : "Couldn't load the photos. Go back and try again.");
        setInstants([]);
      });
  }, [id]);
  const list = instants ?? [];

  const [index, setIndex] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);
  const last = list.length - 1;

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
    Animated.timing(pan, { toValue: delta === 1 ? -SCREEN_W * 1.2 : SCREEN_W * 1.2, duration: 240, useNativeDriver: false }).start(() => {
      setIndex(target);
      pan.setValue(0);
      enter.setValue(0.92);
      Animated.spring(enter, { toValue: 1, friction: 8, tension: 70, useNativeDriver: false }).start();
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

  function react(r: (typeof REACTIONS)[number]) {
    const photo = list[indexRef.current];
    if (!photo) return;
    if (myReaction(photo.key) === r.api) return; // la stessa reazione non conta una seconda volta
    // Una sola reazione per persona: se ne scegli un'altra, sostituisce la precedente (e non conta come nuova).
    setReaction(photo.key, r.api);
    const fresh: Burst[] = [0, 1, 2].map(() => ({ id: burstId.current++, emoji: r.emoji, x: 30 + Math.random() * 220 }));
    setBursts((b) => [...b, ...fresh]);
  }

  const current = list[index];
  const behind = [list[index + 2], list[index + 1]].filter(Boolean);
  const rotations = ['6deg', '-7deg'];
  const rotate = pan.interpolate({ inputRange: [-SCREEN_W, 0, SCREEN_W], outputRange: ['-12deg', '0deg', '12deg'] });
  const dim = pan.interpolate({ inputRange: [-SCREEN_W, 0, SCREEN_W], outputRange: [0.4, 1, 0.4] });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>{event?.title ?? 'Photos'}</Text>
          <Text style={styles.sub}>
            {list.length > 0 ? `${index + 1} of ${list.length} · ` : ''}gone after 24 hours
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.stage} {...swipe.panHandlers}>
        {instants === null ? (
          <View style={styles.photo}>
            <SkeletonBox style={{ flex: 1, borderRadius: r(30), backgroundColor: 'rgba(255,255,255,0.12)' }} />
          </View>
        ) : current ? (
          <>
            {behind.map((it, i) => (
              <View key={it.key} style={[styles.photo, styles.behind, { transform: [{ rotate: rotations[i] }] }]} />
            ))}
            <Animated.View style={[styles.photo, { opacity: dim, transform: [{ translateX: pan }, { rotate }, { scale: enter }] }]}>
              <View style={[styles.fill, styles.frame]}>
                <Image source={{ uri: current.full }} resizeMode="contain" style={{ width: '100%', height: '100%' }} accessibilityLabel="Instant" />
              </View>
            </Animated.View>
          </>
        ) : (
          <View style={[styles.photo, styles.noPhotos]}>
            <Text style={styles.noPhotosText}>{problem ?? 'No photos yet. Check back soon!'}</Text>
          </View>
        )}
        {bursts.map((b) => (
          <FloatingEmoji key={b.id} emoji={b.emoji} x={b.x} onDone={() => setBursts((all) => all.filter((x) => x.id !== b.id))} />
        ))}
      </View>

      <View style={styles.reactions}>
        {REACTIONS.map((r) => (
          <Pressable key={r.api} accessibilityRole="button" accessibilityState={{ selected: current ? myReaction(current.key) === r.api : false }} accessibilityLabel={`React ${r.api}`} onPress={() => react(r)} style={[styles.reactBtn, current && myReaction(current.key) === r.api && styles.reactOn]}>
            <Text style={styles.reactText}>{r.emoji}</Text>
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
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: r(30) },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  behind: { backgroundColor: 'rgba(255,255,255,0.14)' },
  // La foto si vede intera (non ingrandita): resizeMode contain dentro una cornice scura.
  frame: { overflow: 'hidden', borderRadius: r(30), backgroundColor: 'rgba(0,0,0,0.35)' },
  noPhotos: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  noPhotosText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center', padding: 24 },
  reactions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  reactBtn: { width: 56, height: 56, borderRadius: r(28), backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  reactOn: { backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 2, borderColor: '#FFFFFF' },
  reactText: { fontSize: 28 },
  nav: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 },
  pill: { flex: 1, height: 52, borderRadius: r(26), backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  pillOff: { opacity: 0.4 },
  pillText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },
});
