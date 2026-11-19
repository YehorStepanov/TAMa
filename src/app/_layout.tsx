import { Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { EventsProvider } from '@/context/EventsContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <EventsProvider>
      {/* Android: nasconde i tasti di sistema in basso; compaiono scorrendo dal basso verso l'alto. */}
      <NavigationBar hidden />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="instants" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="photo-proof" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reward" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
    </EventsProvider>
  );
}
