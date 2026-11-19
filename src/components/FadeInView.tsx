import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

// Compare con una dissolvenza e un piccolo scorrimento verso l'alto. `index` scagliona l'ingresso di una lista.
export function FadeInView({ children, index = 0 }: { children: ReactNode; index?: number }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, { toValue: 1, duration: 320, delay: Math.min(index, 8) * 50, useNativeDriver: true }).start();
  }, [value, index]);
  return (
    <Animated.View
      style={{
        opacity: value,
        transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}>
      {children}
    </Animated.View>
  );
}
