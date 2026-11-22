import { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AddressLink } from '@/components/AddressLink';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { ServerStatus } from '@/components/ServerStatus';
import { SmallButton } from '@/components/SmallButton';
import { PosterFace, SwipeCard, type SwipeCardHandle } from '@/components/SwipeCard';
import { useEvents } from '@/context/EventsContext';
import type { EventItem } from '@/data/events';
import { colors, sizes } from '@/theme';

type Step = { id: string; added: boolean };

export default function DiscoverScreen() {
  const { visibleEvents, allEvents, loading, error, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const [mode, setMode] = useState<'cards' | 'list'>('cards');
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

  function startOver() {
    setSkipped([]);
    setHistory([]);
  }

  function toggle(e: EventItem) {
    if (isOnMyPage(e.id)) removeFromMyPage(e.id);
    else addToMyPage(e.id);
  }

  const noData = allEvents.length === 0 && (loading || error);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose a day" onPress={() => setMenu(true)} style={styles.dayButton}>
          <Text style={styles.title}>{day === 'All' ? 'Upcoming' : day}</Text>
          <Ionicons name="chevron-down" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.mode}>
          <ModeButton label="Swipe" active={mode === 'cards'} onPress={() => setMode('cards')} />
          <ModeButton label="List" active={mode === 'list'} onPress={() => setMode('list')} />
        </View>
      </View>

      {noData ? (
        <ServerStatus variant="poster" />
      ) : mode === 'cards' ? (
        <>
          <View style={styles.deck}>
            {current ? (
              <>
                {next && (
                  <View style={styles.behind}>
                    <PosterFace event={next} />
                  </View>
                )}
                <SwipeCard key={current.id} ref={cardRef} event={current} onSwiped={handleSwiped} />
              </>
            ) : (
              <View style={styles.done}>
                <Text style={{ fontSize: 56 }}>🎉</Text>
                <Text style={styles.doneTitle}>That's all for now</Text>
                <Text style={styles.doneText}>
                  {shown.length === 0 ? 'No events for this day.' : 'You went through all the events. Use the list to change your mind.'}
                </Text>
                {skipped.length > 0 && (
                  <View style={{ width: '100%' }}>
                    <SmallButton label="Bring back skipped" onPress={startOver} />
                  </View>
                )}
              </View>
            )}
          </View>

          {current && (
            <FadeInView key={current.id} distance={10}>
              <View style={styles.info}>
                <AddressLink address={current.address} label={current.place} />
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {current.title}
                </Text>
                <Text style={styles.keywords}>
                  {current.category} · {current.day} · {current.time}
                </Text>
              </View>
            </FadeInView>
          )}

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
                  note={added ? 'On my page' : skipped.includes(item.id) ? 'Skipped' : undefined}
                  onPress={() => router.push({ pathname: '/mission', params: { id: item.id } })}
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
              <Pressable
                key={d}
                accessibilityRole="button"
                onPress={() => {
                  setPickedDay(d);
                  setMenu(false);
                }}
                style={styles.menuItem}>
                <Text style={[styles.menuText, d === day && { color: colors.primary, fontWeight: '700' }]}>{d === 'All' ? 'Upcoming (all days)' : d}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
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

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.modeBtn, active && styles.modeActive]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sizes.margin, paddingTop: 12, paddingBottom: 10 },
  dayButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: sizes.minTouch },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  mode: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: 999, padding: 3 },
  modeBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: colors.surface },
  modeText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  modeTextActive: { color: colors.primary, fontWeight: '700' },
  deck: { flex: 1, marginHorizontal: sizes.margin, marginBottom: 6 },
  behind: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    bottom: -6,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.tint,
    opacity: 0.85,
  },
  done: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  doneTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  doneText: { fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', marginBottom: 8 },
  info: { paddingHorizontal: sizes.margin, paddingTop: 2 },
  eventTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  keywords: { fontSize: 14, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: sizes.margin, paddingTop: 10, paddingBottom: 12 },
  pill: { height: sizes.buttonPrimary, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillFilled: { backgroundColor: colors.primary },
  pillOutline: { borderWidth: 1.5, borderColor: colors.outline },
  pillText: { fontSize: 16, fontWeight: '700' },
  undo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  undoText: { fontSize: 22, color: colors.muted },
  empty: { fontSize: 16, color: colors.muted, textAlign: 'center', padding: 32, lineHeight: 23 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', paddingTop: 110, paddingHorizontal: sizes.margin },
  menu: { backgroundColor: colors.surface, borderRadius: sizes.radius, paddingVertical: 6, alignSelf: 'flex-start', minWidth: 220, elevation: 8 },
  menuItem: { minHeight: sizes.minTouch, justifyContent: 'center', paddingHorizontal: 20 },
  menuText: { fontSize: 17, color: colors.text },
});
