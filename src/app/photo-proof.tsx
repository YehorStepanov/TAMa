import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '@/components/AppButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

export default function PhotoProofScreen() {
  const { id, challenge } = useLocalSearchParams<{ id: string; challenge?: string }>();
  const { allEvents, addMyPhoto } = useEvents();
  const event = allEvents.find((e) => e.id === id);
  const [uri, setUri] = useState<string | null>(null);

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access in the phone settings, or choose a photo from the gallery.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setUri(res.assets[0].uri);
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setUri(res.assets[0].uri);
  }

  function sendProof() {
    if (!event || !uri) return;
    addMyPhoto(event.id, uri);
    router.replace({ pathname: '/reward', params: { id: event.id, challenge: challenge ?? '' } });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <Text style={styles.title}>Show you were there</Text>
        {event && <Text style={styles.subtitle}>{event.title} · {event.place}</Text>}

        {challenge ? (
          <View style={styles.challenge}>
            <Text style={styles.challengeLabel}>YOUR RANDOM CHALLENGE</Text>
            <Text style={styles.challengeText}>{challenge}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={uri ? 'Take another photo' : 'Take a photo'}
          onPress={takePhoto}
          style={({ pressed }) => [styles.preview, pressed && { opacity: 0.85 }]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" accessibilityLabel="Your photo" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={88} color={colors.primary} />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.bottom}>
        {uri ? (
          <>
            <AppButton label="Send proof" onPress={sendProof} />
            <AppButton variant="secondary" label="Choose another from gallery" onPress={pickFromGallery} />
          </>
        ) : (
          <AppButton label="Choose from gallery" onPress={pickFromGallery} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin, paddingTop: 24, gap: sizes.gap },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: -6 },
  challenge: { backgroundColor: colors.sand, borderRadius: sizes.radius, padding: 16 },
  challengeLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.sandText },
  challengeText: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  preview: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9AA6A4',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 8 },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
});
