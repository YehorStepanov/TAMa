import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing } from 'react-native';

// Compare con una dissolvenza morbida e un piccolo scorrimento verso l'alto. `index` scagliona l'ingresso.
// Cambiando la `key` del componente l'animazione riparte (utile quando il contenuto cambia).
export function FadeInView({ children, index = 0, distance = 20 }: { children: ReactNode; index?: number; distance?: number }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 360,
      delay: Math.min(index, 8) * 60,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [value, index]);
  return (
    <Animated.View
      style={{
        opacity: value,
        transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      }}>
      {children}
    </Animated.View>
  );
}
