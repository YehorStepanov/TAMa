import { Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { EventsProvider } from '@/context/EventsContext';

export default function RootLayout() {
  return (
    <EventsProvider>
      {/* Android: nasconde i tasti di sistema in basso; compaiono scorrendo dal basso verso l'alto. */}
      <NavigationBar hidden />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission" />
        <Stack.Screen name="photo-proof" />
        <Stack.Screen name="reward" options={{ gestureEnabled: false }} />
      </Stack>
    </EventsProvider>
  );
}
