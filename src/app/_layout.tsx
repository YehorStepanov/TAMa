import { Stack } from 'expo-router';
import { EventsProvider } from '@/context/EventsContext';

export default function RootLayout() {
  return (
    <EventsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission" />
      </Stack>
    </EventsProvider>
  );
}
