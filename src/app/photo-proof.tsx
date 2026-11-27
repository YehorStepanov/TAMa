import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { FadeInView } from '@/components/FadeInView';
import { useEvents } from '@/context/EventsContext';
import { VIDEO_UPLOAD_ENABLED } from '@/config';
import { MAX_VIDEO_SECONDS, type ChallengeType, type Level } from '@/data/challenges';
import { photoStatus } from '@/data/events';
import { ApiError } from '@/lib/api';
import { colors, sizes, r } from '@/theme';

type Picked = { uri: string; kind: 'image' | 'video' };

// Anteprima video (solo se il modulo c'è). Per ora i video non vengono inviati, vedi VIDEO_UPLOAD_ENABLED.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Video: any = null;
try {
  Video = require('expo-video');
} catch {
  Video = null;
}

function VideoPreview({ uri }: { uri: string }) {
  if (!Video) return <Text style={styles.placeholderText}>Video selected</Text>;
  const player = Video.useVideoPlayer(uri, (p: { loop: boolean }) => {
    p.loop = true;
  });
  return <Video.VideoView player={player} style={styles.media} contentFit="contain" nativeControls />;
}

export default function PhotoProofScreen() {
  const { id, challenge, type, level, points, media } = useLocalSearchParams<{
    id: string;
    challenge?: string;
    type?: string;
    level?: string;
    points?: string;
    media?: string;
  }>();
  const { allEvents, submitPhoto } = useEvents();
  const [sending, setSending] = useState(false);
  const event = allEvents.find((e) => e.id === id);
  const [picked, setPicked] = useState<Picked | null>(null);

  // Cosa chiede la sfida: solo foto, solo video, oppure indifferente.
  const wantsVideo = media === 'video';
  const allowsVideo = media === 'video' || media === 'any';

  function remember(res: ImagePicker.ImagePickerResult) {
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.type === 'video' && asset.duration != null && asset.duration > MAX_VIDEO_SECONDS * 1000) {
      Alert.alert('That video is a bit long', `Please keep it under ${MAX_VIDEO_SECONDS} seconds.`);
      return;
    }
    setPicked({ uri: asset.uri, kind: asset.type === 'video' ? 'video' : 'image' });
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', "AHOJ needs your camera to take the photo. You can turn it on in your phone's settings, or pick one from your gallery instead.");
      return;
    }
    remember(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 }));
  }

  async function recordVideo() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', "AHOJ needs your camera to take the photo. You can turn it on in your phone's settings, or pick one from your gallery instead.");
      return;
    }
    remember(await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: MAX_VIDEO_SECONDS, quality: 0.7 }));
  }

  async function pickFromGallery() {
    const types: ImagePicker.MediaType[] = media === 'video' ? ['videos'] : media === 'any' ? ['images', 'videos'] : ['images'];
    remember(await ImagePicker.launchImageLibraryAsync({ mediaTypes: types, quality: 0.7 }));
  }

  async function sendProof() {
    if (!event || !picked || sending) return;
    if (photoStatus(event) !== 'open') {
      Alert.alert('Not just yet', 'Photos can be sent while the event is on, and for a little while after it ends.');
      return;
    }
    if (picked.kind === 'video' && !VIDEO_UPLOAD_ENABLED) {
      Alert.alert("Videos aren't supported yet", 'Please send a photo instead.');
      return;
    }
    const pts = Number(points) || 50;
    setSending(true);
    try {
      await submitPhoto(event.id, picked.uri, {
        challenge: challenge ?? '',
        type: (type as ChallengeType) ?? 'solo',
        level: (level as Level) ?? 'medium',
      });
      router.replace({ pathname: '/reward', params: { id: event.id, points: String(pts), challenge: challenge ?? '' } });
    } catch (e) {
      const conflict = e instanceof ApiError && e.status === 409;
      Alert.alert(conflict ? 'Already sent' : "Couldn't send it", conflict ? "You've already sent a photo for this event." : e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Text style={styles.title}>{wantsVideo ? 'Film it!' : 'Show you were there'}</Text>
        {event && (
          <Text style={styles.subtitle}>
            {event.title} · {event.place}
          </Text>
        )}

        {challenge ? (
          <FadeInView index={1}>
          <View style={styles.challenge}>
            <Text style={styles.challengeLabel}>
              YOUR CHALLENGE · {type === 'group' ? 'GROUP' : 'SOLO'} · +{points} PTS
            </Text>
            <Text style={styles.challengeText}>{challenge}</Text>
          </View>
          </FadeInView>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={wantsVideo ? 'Record a video' : 'Take a photo'}
          onPress={wantsVideo ? recordVideo : takePhoto}
          style={({ pressed }) => [styles.preview, pressed && { opacity: 0.85 }]}>
          {picked ? (
            picked.kind === 'video' ? (
              <VideoPreview uri={picked.uri} />
            ) : (
              <Image source={{ uri: picked.uri }} style={styles.media} resizeMode="cover" accessibilityLabel="Your photo" />
            )
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name={wantsVideo ? 'videocam-outline' : 'camera-outline'} size={64} color={colors.primary} />
              <Text style={styles.placeholderText}>{wantsVideo ? `Tap to record (up to ${MAX_VIDEO_SECONDS} s)` : 'Tap to take a photo'}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.bottom}>
        {picked ? (
          <>
            <AppButton label={sending ? 'Sending…' : 'Send it'} onPress={sendProof} />
            <AppButton variant="secondary" label="Pick a different one" onPress={pickFromGallery} />
          </>
        ) : (
          <>
            <AppButton label="Pick from your gallery" onPress={pickFromGallery} />
            {allowsVideo && !wantsVideo && <AppButton variant="secondary" label="Record a video" onPress={recordVideo} />}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin, paddingTop: 24, gap: sizes.gap },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: -6 },
  challenge: { backgroundColor: colors.sand, borderRadius: r(sizes.radius), padding: 16 },
  challengeLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: colors.sandText },
  challengeText: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  preview: {
    flex: 1,
    borderRadius: r(20),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  media: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 8 },
  placeholderText: { fontSize: 16, fontWeight: '700', color: colors.muted },
  bottom: { paddingHorizontal: sizes.margin, paddingVertical: 12, gap: 8 },
});
