import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useEvents, type CoachStep } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

// ---- Punti dello schermo che il tutorial può evidenziare ----
// Qualsiasi elemento che sa dire dove si trova sullo schermo.
type Measurable = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void };
const targets = new Map<string, Measurable>();

export function CoachTarget({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  useEffect(() => {
    const node = ref.current as Measurable | null;
    if (node) targets.set(id, node);
    return () => {
      if (targets.get(id) === node) targets.delete(id);
    };
  });
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

type Rect = { x: number; y: number; w: number; h: number };

// Cosa mostra ogni passo. `tab` = posizione nella barra in basso (My events, Discover, Map, Photos).
const STEPS: Record<CoachStep, { screen: 'home' | 'discover'; emoji: string; text: string; tab?: number; target?: string; tapIt?: boolean }> = {
  events: { screen: 'home', emoji: '👆', text: 'Your events live here. Tap one to take its challenge.', target: 'firstEvent' },
  map: { screen: 'home', emoji: '📍', text: "See where everything's happening.", tab: 2 },
  photos: { screen: 'home', emoji: '📸', text: 'Photos from your events show up here.', tab: 3 },
  goDiscover: { screen: 'home', emoji: '✨', text: 'Tap here to find new events!', tab: 1, tapIt: true },
  swipe: { screen: 'discover', emoji: '', text: '' },
  buttons: { screen: 'discover', emoji: '↩', text: 'Prefer tapping? Use these. ↩ undoes your last swipe.', target: 'actions' },
};
const ORDER: CoachStep[] = ['events', 'map', 'photos', 'goDiscover', 'swipe', 'buttons'];
const DIM = 'rgba(18,22,26,0.76)';
const TAB_BAR_HEIGHT = 84; // lo stesso valore della barra in basso (+ margine di sicurezza del telefono)

// Gesto di esempio: una carta fantasma che si trascina a destra (aggiungi) e a sinistra (salta).
function SwipeHint() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(t, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(t, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(250),
        Animated.timing(t, { toValue: -1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(t, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const translateX = t.interpolate({ inputRange: [-1, 0, 1], outputRange: [-90, 0, 90] });
  const rotate = t.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-9deg', '0deg', '9deg'] });
  const add = t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' });
  const skip = t.interpolate({ inputRange: [-1, -0.6, 0], outputRange: [1, 0, 0], extrapolate: 'clamp' });
  return (
    <View style={styles.hintWrap}>
      <Animated.Text style={[styles.hintLabel, { left: 0, opacity: skip }]}>✕ Skip</Animated.Text>
      <Animated.Text style={[styles.hintLabel, { right: 0, opacity: add }]}>Add ♥</Animated.Text>
      <Animated.View style={[styles.ghost, { transform: [{ translateX }, { rotate }] }]}>
        <Text style={{ fontSize: 56 }}>🎭</Text>
        <Text style={styles.finger}>👆</Text>
      </Animated.View>
    </View>
  );
}

// Anello che pulsa attorno al punto evidenziato.
function Ring({ rect, radius }: { rect: Rect; radius: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <>
      <View pointerEvents="none" style={[styles.ring, { left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: radius }]} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            borderRadius: radius,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
          },
        ]}
      />
    </>
  );
}

// Il tutorial: un velo scuro e trasparente sopra le schermate vere, con un riquadro luminoso sul punto da toccare.
export function CoachOverlay() {
  const { coach, setCoach, endTutorial } = useEvents();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect | null>(null);

  const spec = coach ? STEPS[coach] : null;
  const here = spec ? (spec.screen === 'home' ? pathname === '/' : pathname === '/discover') : false;

  // Quando tocchi Discover come richiesto, si passa al passo successivo.
  useEffect(() => {
    if (coach === 'goDiscover' && pathname === '/discover') {
      const timer = setTimeout(() => setCoach('swipe'), 450);
      return () => clearTimeout(timer);
    }
  }, [coach, pathname, setCoach]);

  // Trovo dove si trova il punto da evidenziare.
  useEffect(() => {
    setRect(null);
    if (!coach || !spec || !here || size.w === 0) return;
    if (spec.tab !== undefined) {
      const tabH = TAB_BAR_HEIGHT + insets.bottom;
      setRect({ x: (spec.tab * size.w) / 4, y: size.h - tabH, w: size.w / 4, h: tabH });
      return;
    }
    if (spec.target) {
      const timer = setTimeout(() => {
        targets.get(spec.target!)?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) setRect({ x, y, w, h });
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [coach, here, size.w, size.h, insets.bottom]); // eslint-disable-line react-hooks/exhaustive-deps

  function next() {
    if (!coach) return;
    const i = ORDER.indexOf(coach);
    if (i === ORDER.length - 1) endTutorial();
    else setCoach(ORDER[i + 1]);
  }

  const isLast = coach === ORDER[ORDER.length - 1];

  return (
    <View
      pointerEvents={coach && spec && here ? 'box-none' : 'none'}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={StyleSheet.absoluteFill}>
      {coach && spec && here && size.w > 0 && (
        <>
          {coach === 'swipe' ? (
            // Passo del gesto: velo su tutto lo schermo con la carta fantasma.
            <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: DIM, alignItems: 'center', justifyContent: 'center' }]} onPress={next}>
              <SwipeHint />
              <Text style={styles.swipeText}>Swipe right to add, left to skip.</Text>
            </Pressable>
          ) : rect ? (
            <Spotlight rect={rect} size={size} pass={!!spec.tapIt} onTapOutside={next} />
          ) : (
            <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} onPress={next} />
          )}

          {/* Il fumetto con una frase breve */}
          {coach !== 'swipe' && (
            <Bubble rect={rect} height={size.h} emoji={spec.emoji} text={spec.text} showButton={!spec.tapIt} label={isLast ? 'Done' : 'Got it'} onNext={next} />
          )}
          {coach === 'swipe' && (
            <View style={[styles.bottomBar, { bottom: insets.bottom + 24 }]}>
              <Pressable accessibilityRole="button" onPress={next} style={styles.gotIt}>
                <Text style={styles.gotItText}>Got it</Text>
              </Pressable>
            </View>
          )}

          <Pressable accessibilityRole="button" accessibilityLabel="Skip the tutorial" onPress={endTutorial} style={[styles.skip, { top: insets.top + 8 }]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// Velo scuro con un "buco" attorno al punto evidenziato (4 rettangoli) e l'anello che pulsa.
function Spotlight({ rect, size, pass, onTapOutside }: { rect: Rect; size: { w: number; h: number }; pass: boolean; onTapOutside: () => void }) {
  const pad = 6;
  const x = Math.max(rect.x - pad, 0);
  const y = Math.max(rect.y - pad, 0);
  const w = Math.min(rect.w + pad * 2, size.w - x);
  const h = Math.min(rect.h + pad * 2, size.h - y);
  const block = (style: ViewStyle, key: string) => <Pressable key={key} onPress={pass ? undefined : onTapOutside} style={[styles.dim, style]} />;
  return (
    <>
      {block({ left: 0, top: 0, width: size.w, height: y }, 't')}
      {block({ left: 0, top: y + h, width: size.w, height: size.h - y - h }, 'b')}
      {block({ left: 0, top: y, width: x, height: h }, 'l')}
      {block({ left: x + w, top: y, width: size.w - x - w, height: h }, 'r')}
      {/* Nei passi "tocca qui" il buco lascia passare il tocco; negli altri lo cattura. */}
      {!pass && <Pressable onPress={onTapOutside} style={{ position: 'absolute', left: x, top: y, width: w, height: h }} />}
      <Ring rect={{ x, y, w, h }} radius={18} />
    </>
  );
}

function Bubble({ rect, height, emoji, text, showButton, label, onNext }: { rect: Rect | null; height: number; emoji: string; text: string; showButton: boolean; label: string; onNext: () => void }) {
  // Sopra il punto evidenziato se questo è nella metà bassa dello schermo, altrimenti sotto.
  const above = !rect || rect.y + rect.h / 2 > height / 2;
  const pos: ViewStyle = !rect
    ? { top: height / 2 - 70 }
    : above
      ? { bottom: height - rect.y + 22 }
      : { top: rect.y + rect.h + 22 };
  return (
    <View pointerEvents="box-none" style={[styles.bubbleWrap, pos]}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleEmoji}>{emoji}</Text>
        <Text style={styles.bubbleText}>{text}</Text>
        {showButton && (
          <Pressable accessibilityRole="button" onPress={onNext} style={styles.gotItSmall}>
            <Text style={styles.gotItText}>{label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: DIM },
  ring: { position: 'absolute', borderWidth: 3, borderColor: '#FFFFFF' },
  bubbleWrap: { position: 'absolute', left: 20, right: 20 },
  bubble: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 8 },
  bubbleEmoji: { fontSize: 28 },
  bubbleText: { flex: 1, fontSize: 17, lineHeight: 23, fontWeight: '600', color: colors.text },
  gotItSmall: { minHeight: sizes.minTouch, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  gotIt: { minHeight: sizes.buttonPrimary, paddingHorizontal: 48, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  gotItText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },
  bottomBar: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  skip: { position: 'absolute', right: 12, minHeight: sizes.minTouch, minWidth: sizes.minTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  hintWrap: { width: 280, height: 220, alignItems: 'center', justifyContent: 'center' },
  hintLabel: { position: 'absolute', top: 96, fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  ghost: { width: 140, height: 190, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  finger: { position: 'absolute', bottom: -18, right: -6, fontSize: 40 },
  swipeText: { marginTop: 36, fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', paddingHorizontal: 40 },
});
