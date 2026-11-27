import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

const W = Dimensions.get('window').width;

// Una carta che si muove a destra e a sinistra: mostra come funziona lo swipe.
function SwipeDemo() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(t, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(t, { toValue: -1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(t, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const translateX = t.interpolate({ inputRange: [-1, 0, 1], outputRange: [-70, 0, 70] });
  const rotate = t.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-10deg', '0deg', '10deg'] });
  const addOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = t.interpolate({ inputRange: [-1, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  return (
    <View style={styles.demo}>
      <Animated.Text style={[styles.side, { left: 0, opacity: skipOpacity, color: colors.muted }]}>✕ skip</Animated.Text>
      <Animated.Text style={[styles.side, { right: 0, opacity: addOpacity, color: colors.primary }]}>♥ add</Animated.Text>
      <Animated.View style={[styles.demoCard, { transform: [{ translateX }, { rotate }] }]}>
        <Text style={{ fontSize: 64 }}>🎭</Text>
      </Animated.View>
    </View>
  );
}

const SLIDES: { title: string; text: string; visual: 'emoji' | 'swipe'; emoji?: string }[] = [
  { title: 'Welcome to AHOJ', text: 'Find events, take on little challenges and meet new people.', visual: 'emoji', emoji: '👋' },
  { title: 'Find new events', text: 'Open Discover and swipe. Right to save an event, left to skip it.', visual: 'swipe' },
  { title: 'Take the challenge', text: 'At the event, open it in My events and send a photo to earn points.', visual: 'emoji', emoji: '📸' },
  { title: 'See everyone\u2019s photos', text: 'Once you\u2019ve sent yours, you can look at the others and react with an emoji.', visual: 'emoji', emoji: '🔥' },
];

// Mini tutorial della prima volta: poche parole, un'immagine per schermata. Si salta in qualsiasi momento.
export function Tutorial() {
  const { tutorialVisible, closeTutorial } = useEvents();
  const [index, setIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scroll = useRef<any>(null);
  const last = index === SLIDES.length - 1;

  useEffect(() => {
    if (tutorialVisible) setIndex(0);
  }, [tutorialVisible]);

  function next() {
    if (last) {
      closeTutorial();
      return;
    }
    scroll.current?.scrollTo({ x: (index + 1) * W, animated: true });
    setIndex(index + 1);
  }

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / W));
  }

  return (
    <Modal visible={tutorialVisible} animationType="fade" onRequestClose={closeTutorial}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Skip the tutorial" onPress={closeTutorial} style={styles.skip}>
            <Text style={styles.skipText}>{last ? '' : 'Skip'}</Text>
          </Pressable>
        </View>

        <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd} style={{ flex: 1 }}>
          {SLIDES.map((s) => (
            <View key={s.title} style={styles.slide}>
              {s.visual === 'swipe' ? (
                <SwipeDemo />
              ) : (
                <View style={styles.bubble}>
                  <Text style={{ fontSize: 72 }}>{s.emoji}</Text>
                </View>
              )}
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.text}>{s.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>
        <View style={styles.bottom}>
          <AppButton label={last ? "Let's go" : 'Next'} onPress={next} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { height: 56, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: sizes.margin },
  skip: { minHeight: sizes.minTouch, minWidth: sizes.minTouch, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 16, fontWeight: '700', color: colors.muted },
  slide: { width: W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 },
  bubble: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' },
  text: { fontSize: 18, lineHeight: 26, color: colors.muted, textAlign: 'center' },
  demo: { width: 260, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  demoCard: { width: 130, height: 170, borderRadius: 24, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  side: { position: 'absolute', top: 80, fontSize: 18, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.outline },
  dotOn: { width: 24, backgroundColor: colors.primary },
  bottom: { paddingHorizontal: sizes.margin, paddingBottom: 16 },
});
