import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AddressLink } from '@/components/AddressLink';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { ServerStatus } from '@/components/ServerStatus';
import { SmallButton } from '@/components/SmallButton';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { colors, sizes } from '@/theme';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = Math.round(SCREEN_W * 0.74); // così la carta successiva si intravede a destra
const CARD_H = Math.round(CARD_W * 1.5);
const GAP = 14;

function openEvent(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

// Il manifesto dell'evento: foto di copertina a tutta carta (oppure l'emoji se non c'è la foto).
function Poster({ event, onPress }: { event: EventItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${event.title}`} onPress={onPress} style={styles.poster}>
      {event.coverUrl ? (
        <Image source={{ uri: event.coverUrl }} style={styles.posterImage} resizeMode="cover" />
      ) : (
        <View style={[styles.posterImage, styles.posterEmpty]}>
          <Text style={{ fontSize: 88 }}>{event.emoji}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const { allEvents, loading, error, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const [mode, setMode] = useState<'cards' | 'list'>('cards');
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList<EventItem>>(null);

  // Solo gli eventi non ancora finiti; i giorni disponibili per il menu in alto.
  const upcoming = allEvents.filter((e) => e.endsAt.getTime() > Date.now());
  const days = Array.from(new Set(upcoming.map((e) => e.day)));
  // All'inizio si vedono tutti gli eventi in arrivo; dal menu si sceglie un giorno solo.
  const day = pickedDay ?? 'All';
  const shown = day === 'All' ? upcoming : upcoming.filter((e) => e.day === day);
  const current = shown[Math.min(active, Math.max(shown.length - 1, 0))];

  function chooseDay(d: string) {
    setPickedDay(d);
    setActive(0);
    setMenu(false);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }

  function toggle(e: EventItem) {
    if (isOnMyPage(e.id)) removeFromMyPage(e.id);
    else addToMyPage(e.id);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose a day"
          onPress={() => setMenu(true)}
          style={styles.dayButton}>
          <Text style={styles.title}>{day === 'All' ? 'Upcoming' : day}</Text>
          <Ionicons name="chevron-down" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.mode}>
          <ModeButton label="Cards" active={mode === 'cards'} onPress={() => setMode('cards')} />
          <ModeButton label="List" active={mode === 'list'} onPress={() => setMode('list')} />
        </View>
      </View>

      {allEvents.length === 0 && (loading || error) ? (
        <View style={{ paddingHorizontal: sizes.margin }}>
          <ServerStatus />
        </View>
      ) : shown.length === 0 && mode === 'cards' ? (
        <Text style={styles.empty}>No events for this day. Pick another day from the menu above.</Text>
      ) : mode === 'cards' ? (
        <>
          <FlatList
            ref={listRef}
            data={shown}
            horizontal
            keyExtractor={(e) => e.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + GAP}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: sizes.margin, gap: GAP }}
            style={{ flexGrow: 0 }}
            onMomentumScrollEnd={(ev) => setActive(Math.round(ev.nativeEvent.contentOffset.x / (CARD_W + GAP)))}
            renderItem={({ item }) => <Poster event={item} onPress={() => openEvent(item.id)} />}
          />
          {current && (
            <FadeInView key={current.id} distance={10}>
              <View style={styles.info}>
                <View style={{ flex: 1 }}>
                  <AddressLink address={current.address} label={current.place} />
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {current.title}
                  </Text>
                  <Text style={styles.keywords}>
                    {current.category} · {current.day} · {current.time}
                  </Text>
                </View>
                {isOnMyPage(current.id) ? (
                  <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${current.title} from my page`} onPress={() => toggle(current)} />
                ) : (
                  <SmallButton label="Add" accessibilityLabel={`Add ${current.title} to my page`} onPress={() => toggle(current)} />
                )}
              </View>
            </FadeInView>
          )}
        </>
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ gap: sizes.gap, padding: sizes.margin, paddingTop: 12 }}
          ListEmptyComponent={<Text style={styles.empty}>No events yet.</Text>}
          renderItem={({ item, index }) => {
            const added = isOnMyPage(item.id);
            return (
              <FadeInView index={index}>
                <EventCard
                  event={item}
                  showDay
                  showAddress
                  note={added ? 'On my page' : undefined}
                  onPress={() => openEvent(item.id)}
                  right={
                    added ? (
                      <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${item.title} from my page`} onPress={() => toggle(item)} />
                    ) : (
                      <SmallButton label="Add" accessibilityLabel={`Add ${item.title} to my page`} onPress={() => toggle(item)} />
                    )
                  }
                />
              </FadeInView>
            );
          }}
        />
      )}

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenu(false)}>
          <View style={styles.menu}>
            {['All', ...days].map((d) => (
              <Pressable key={d} accessibilityRole="button" onPress={() => chooseDay(d)} style={styles.menuItem}>
                <Text style={[styles.menuText, d === day && { color: colors.primary, fontWeight: '700' }]}>{d === 'All' ? 'Upcoming (all days)' : d}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.modeBtn, active && styles.modeActive]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sizes.margin, paddingTop: 12, paddingBottom: 14 },
  dayButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: sizes.minTouch },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  mode: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: 999, padding: 3 },
  modeBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: colors.surface },
  modeText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  modeTextActive: { color: colors.primary, fontWeight: '700' },
  poster: { width: CARD_W, height: CARD_H, borderRadius: 28, overflow: 'hidden', backgroundColor: colors.tint, elevation: 4 },
  posterImage: { width: '100%', height: '100%' },
  posterEmpty: { alignItems: 'center', justifyContent: 'center' },
  info: { flexDirection: 'row', alignItems: 'center', gap: sizes.gap, paddingHorizontal: sizes.margin, paddingTop: 10 },
  eventTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  keywords: { fontSize: 14, color: colors.muted, marginTop: 2 },
  empty: { fontSize: 16, color: colors.muted, textAlign: 'center', padding: 32, lineHeight: 23 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', paddingTop: 110, paddingHorizontal: sizes.margin },
  menu: { backgroundColor: colors.surface, borderRadius: sizes.radius, paddingVertical: 6, alignSelf: 'flex-start', minWidth: 220, elevation: 8 },
  menuItem: { minHeight: sizes.minTouch, justifyContent: 'center', paddingHorizontal: 20 },
  menuText: { fontSize: 17, color: colors.text },
});
