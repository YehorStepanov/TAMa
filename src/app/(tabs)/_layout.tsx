import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => <Ionicons name={focused ? active : inactive} size={26} color={color as string} />;
}

// Barra di navigazione in basso (zona del pollice): My events · Discover · Map · Photos, con icona e scritta.
export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.88)',
          borderTopColor: colors.glassBorder,
          height: 72 + insets.bottom,
          paddingTop: 0,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: { alignItems: 'center', justifyContent: 'center' },
        tabBarIconStyle: { marginTop: 0 },
        tabBarLabelPosition: 'below-icon',
      }}>
      <Tabs.Screen name="index" options={{ title: 'My events', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: tabIcon('search', 'search-outline') }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tabIcon('map', 'map-outline') }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos', tabBarIcon: tabIcon('images', 'images-outline') }} />
    </Tabs>
  );
}
