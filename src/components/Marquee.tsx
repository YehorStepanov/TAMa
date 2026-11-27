import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View, type TextStyle } from 'react-native';

// Una riga di testo che, se è troppo lunga per starci, scorre da sola avanti e indietro per farsi leggere tutta.
// Se ci sta, resta ferma.
export function Marquee({ text, style, height }: { text: string; style: TextStyle; height: number }) {
  const [box, setBox] = useState(0);
  const [full, setFull] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const overflow = box > 0 && full > box;

  useEffect(() => {
    x.setValue(0);
    if (!overflow) return;
    const distance = full - box + 10;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(x, { toValue: -distance, duration: Math.max(1600, distance * 30), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(x, { toValue: 0, duration: Math.max(1000, distance * 18), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [overflow, full, box, x]);

  return (
    <View style={{ height, overflow: 'hidden' }} onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      {/* Il testo vive in uno spazio molto largo, così non va mai a capo e se ne misura la lunghezza vera. */}
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 1500, transform: [{ translateX: x }] }}>
        <Text style={style} onTextLayout={(e) => setFull(Math.ceil(e.nativeEvent.lines[0]?.width ?? 0))}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}
