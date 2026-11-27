import { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CardAction } from '@/components/CardAction';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { Screen, useTabSpace } from '@/components/Screen';
import { ServerStatus } from '@/components/ServerStatus';
import { SmallButton } from '@/components/SmallButton';
import { StatChips } from '@/components/StatChips';
import { PosterFace, SwipeCard, type SwipeCardHandle } from '@/components/SwipeCard';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { colors, sizes, r } from '@/theme';

type Step = { id: string; added: boolean };
type Mode = 'swipe' | 'list';

function openEvent(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

// Discover: la schermata principale. Sfoglia gli eventi come carte da trascinare, in lista o sulla mappa.
export default function DiscoverScreen() {
  const { visibleEvents, allEvents, loading, error, refresh, refreshing, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const tabSpace = useTabSpace();
  const [mode, setMode] = useState<Mode>('swipe');
  const [pickedDay, setPickedDay] = useState<string>('All');
  const [menu, setMenu] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [history, setHistory] = useState<Step[]>([]);
  const cardRef = useRef<SwipeCardHandle>(null);

  // Eventi non ancora scaduti (si vedono anche quelli di ieri); i giorni disponibili per il menu in alto.
  const days = Array.from(new Set(visibleEvents.map((e) => e.day)));
  const day = days.includes(pickedDay) ? pickedDay : 'All';
  const shown = day === 'All' ? visibleEvents : visibleEvents.filter((e) => e.day === day);

  // Il mazzo: quelli che non ho ancora aggiunto né saltato.
  const deck = shown.filter((e) => !isOnMyPage(e.id) && !skipped.includes(e.id));
  const current = deck[0];
  const next = deck[1];

  function handleSwiped(dir: 'left' | 'right') {
    if (!current) return;
    const added = dir === 'right';
    if (added) addToMyPage(current.id);
    else setSkipped((s) => [...s, current.id]);
    setHistory((h) => [...h, { id: current.id, added }]);
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    if (last.added) removeFromMyPage(last.id);
    else setSkipped((s) => s.filter((id) => id !== last.id));
    setHistory((h) => h.slice(0, -1));
  }

  function toggle(e: EventItem) {
    if (isOnMyPage(e.id)) removeFromMyPage(e.id);
    else addToMyPage(e.id);
  }

  const noData = allEvents.length === 0 && (loading || error);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose a day" onPress={() => setMenu(true)} style={styles.dayButton}>
          <Text style={styles.title}>{day === 'All' ? 'Upcoming' : day}</Text>
          <Ionicons name="chevron-down" size={22} color={colors.text} />
        </Pressable>
        <StatChips />
      </View>
      <View style={styles.modes}>
        {(['swipe', 'list'] as Mode[]).map((m) => (
          <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: mode === m }} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeActive]}>
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m === 'swipe' ? 'Swipe' : 'List'}</Text>
          </Pressable>
        ))}
      </View>

      {noData ? (
        <ServerStatus variant="poster" />
      ) : mode === 'swipe' ? (
        <>
          <View style={styles.deck}>
            {current ? (
              <>
                {next && (
                  <View style={styles.behind}>
                    <PosterFace event={next} />
                  </View>
                )}
                <SwipeCard key={current.id} ref={cardRef} event={current} onSwiped={handleSwiped} onPress={() => openEvent(current.id)} />
              </>
            ) : (
              <View style={styles.done}>
                <Text style={{ fontSize: 56 }}>🎉</Text>
                <Text style={styles.doneTitle}>{shown.length === 0 ? 'Nothing here yet' : "You've seen them all!"}</Text>
                <Text style={styles.doneText}>
                  {shown.length === 0
                    ? 'No events on this day. Try another day, or check back soon.'
                    : 'Changed your mind? Tap the ↩ button to bring back the last one, or switch to List to see everything.'}
                </Text>
                {skipped.length > 0 && (
                  <View style={{ width: '100%' }}>
                    <SmallButton label="Show skipped events again" onPress={() => { setSkipped([]); setHistory([]); }} />
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <ActionPill label="✕  Skip" disabled={!current} onPress={() => cardRef.current?.swipe('left')} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo"
              disabled={history.length === 0}
              onPress={undo}
              style={[styles.undo, history.length === 0 && { opacity: 0.4 }]}>
              <Text style={styles.undoText}>↩</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <ActionPill label="♥  Add" filled disabled={!current} onPress={() => cardRef.current?.swipe('right')} />
            </View>
          </View>
        </>
      ) : (
        <FlatList
          data={visibleEvents}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ gap: sizes.gap, padding: sizes.margin, paddingTop: 12, paddingBottom: tabSpace }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No events yet. Check back soon!</Text>}
          renderItem={({ item, index }) => {
            const added = isOnMyPage(item.id);
            return (
              <FadeInView index={index}>
                <EventCard
                  event={item}
                  showDay
                  showAddress
                  note={added ? 'In your events' : skipped.includes(item.id) ? 'Skipped' : undefined}
                  onPress={() => openEvent(item.id)}
                  right={
                    added ? (
                      <CardAction tone="remove" label={`Remove ${item.title} from my calendar`} onPress={() => toggle(item)} />
                    ) : (
                      <CardAction tone="add" label={`Add ${item.title} to my calendar`} onPress={() => toggle(item)} />
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
              <Pressable
                key={d}
                accessibilityRole="button"
                onPress={() => {
                  setPickedDay(d);
                  setMenu(false);
                }}
                style={styles.menuItem}>
                <Text style={[styles.menuText, d === day && { color: colors.primary, fontWeight: '700' }]}>{d === 'All' ? 'All upcoming events' : d}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function ActionPill({ label, filled = false, disabled = false, onPress }: { label: string; filled?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[styles.pill, filled ? styles.pillFilled : styles.pillOutline, disabled && { opacity: 0.4 }]}>
      <Text style={[styles.pillText, { color: filled ? colors.onPrimary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: sizes.margin, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  place: { fontSize: 16, fontWeight: '600', color: colors.muted },
  dayButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: sizes.minTouch, alignSelf: 'flex-start' },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  modes: { flexDirection: 'row', marginHorizontal: sizes.margin, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: r(999), padding: 3 },
  modeBtn: { flex: 1, minHeight: 44, borderRadius: r(999), alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: colors.surface },
  modeText: { fontSize: 16, fontWeight: '600', color: colors.muted },
  modeTextActive: { color: colors.primary, fontWeight: '700' },
  deck: { flex: 1, marginHorizontal: sizes.margin, marginBottom: 6 },
  behind: { position: 'absolute', top: 10, left: 14, right: 14, bottom: -6, borderRadius: r(28), overflow: 'hidden', backgroundColor: colors.tint, opacity: 0.85 },
  done: { flex: 1, backgroundColor: colors.glass, borderRadius: r(28), borderWidth: 1, borderColor: colors.glassBorder, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10 },
  doneTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  doneText: { fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', marginBottom: 8 },
  info: { paddingHorizontal: sizes.margin, paddingTop: 2 },
  eventTitle: { fontSize: 26, fontWeight: '700', color: colors.text },
  keywords: { fontSize: 16, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: sizes.margin, paddingTop: 10, paddingBottom: 4 },
  pill: { height: sizes.buttonPrimary, borderRadius: r(999), alignItems: 'center', justifyContent: 'center' },
  pillFilled: { backgroundColor: colors.primary },
  pillOutline: { borderWidth: 1.5, borderColor: colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.5)' },
  pillText: { fontSize: 16, fontWeight: '700' },
  undo: { width: 52, height: 52, borderRadius: r(26), borderWidth: 1.5, borderColor: colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  undoText: { fontSize: 22, color: colors.muted },
  empty: { fontSize: 16, color: colors.muted, textAlign: 'center', padding: 32, lineHeight: 23 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', paddingTop: 110, paddingHorizontal: sizes.margin },
  menu: { backgroundColor: colors.surface, borderRadius: r(sizes.radius), paddingVertical: 6, alignSelf: 'flex-start', minWidth: 220, elevation: 8 },
  menuItem: { minHeight: sizes.minTouch, justifyContent: 'center', paddingHorizontal: 20 },
  menuText: { fontSize: 17, color: colors.text },
});
