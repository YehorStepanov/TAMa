import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* title */}
      <Stack.Screen name="index" options={{ title: 'Fuck it!' }} />
    </Stack>
  );
}