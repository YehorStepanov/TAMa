import { Stack } from 'expo-router';
import type { ComponentType } from 'react';

// Se per qualche motivo questo modulo nativo manca, l'app parte lo stesso (senza nascondere i tasti di Android).
let HideNavigationBar: ComponentType<{ hidden?: boolean }> | null = null;
try {
  HideNavigationBar = require('expo-navigation-bar').NavigationBar;
} catch {
  HideNavigationBar = null;
}
import { View } from 'react-native';
import { OngoingSheet } from '@/components/OngoingSheet';
import { EventsProvider } from '@/context/EventsContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <EventsProvider>
      {/* Android: nasconde i tasti di sistema in basso; compaiono scorrendo dal basso verso l'alto. */}
      {HideNavigationBar ? <HideNavigationBar hidden /> : null}
      <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="memory" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="instants" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="photo-proof" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reward" options={{ gestureEnabled: false, animation: 'fade_from_bottom' }} />
      </Stack>
      <OngoingSheet />
      </View>
    </EventsProvider>
  );
}
