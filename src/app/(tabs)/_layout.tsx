import { Tabs } from 'expo-router';
import { colors } from '@/theme';

// Barra di navigazione in basso (zona del pollice): Today · Discover · Photos.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarItemStyle: { paddingVertical: 10 },
        tabBarIcon: () => null, // le icone arrivano dopo
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos' }} />
    </Tabs>
  );
}
