import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { SmallButton } from '@/components/SmallButton';
import { EventFace, SwipeCard, type SwipeCardHandle } from '@/components/SwipeCard';
import { StatusStrip } from '@/components/StatusStrip';
import { useEvents } from '@/context/EventsContext';
import { DAY_ORDER } from '@/data/events';
import { colors, sizes } from '@/theme';

type Step = { id: string; added: boolean };

export default function DiscoverScreen() {
  const { allEvents, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  // Coda di eventi da mostrare: quelli che non sono ancora sulla mia pagina.
  const [queue, setQueue] = useState<string[]>(() => allEvents.filter((e) => !isOnMyPage(e.id)).map((e) => e.id));
  const [history, setHistory] = useState<Step[]>([]);
  const cardRef = useRef<SwipeCardHandle>(null);
  const [mode, setMode] = useState<'cards' | 'list'>('cards');

  // Le carte da mostrare: quelle in coda che non sono già sulla mia pagina (anche se le ho aggiunte dalla lista).
  const visible = queue.filter((id) => !isOnMyPage(id));
  const current = allEvents.find((e) => e.id === visible[0]);
  const next = allEvents.find((e) => e.id === visible[1]);

  // Eventi che ho saltato con lo swipe (e non ho poi aggiunto).
  const skipped = history.filter((h) => !h.added).map((h) => h.id);
  const listEvents = [...allEvents].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  function listAdd(id: string) {
    addToMyPage(id);
  }
  function listRemove(id: string) {
    removeFromMyPage(id);
    // Rimesso nel mazzo, così lo ritrovo anche tra le carte.
    setQueue((q) => (q.includes(id) ? q : [...q, id]));
  }

  function handleSwiped(dir: 'left' | 'right') {
    if (!current) return;
    const added = dir === 'right';
    if (added) addToMyPage(current.id);
    setHistory((h) => [...h, { id: current.id, added }]);
    setQueue((q) => q.slice(1));
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    if (last.added) removeFromMyPage(last.id);
    setHistory((h) => h.slice(0, -1));
    setQueue((q) => [last.id, ...q]);
  }

  function startOver() {
    setQueue(allEvents.filter((e) => !isOnMyPage(e.id)).map((e) => e.id));
    setHistory([]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <StatusStrip />
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>
          {mode === 'list' ? `${listEvents.length} events` : current ? `${visible.length} left · swipe right to add, left to skip` : 'You have seen everything'}
        </Text>

        <View style={styles.segment}>
          <Segment label="Cards" active={mode === 'cards'} onPress={() => setMode('cards')} />
          <Segment label="List" active={mode === 'list'} onPress={() => setMode('list')} />
        </View>

        {mode === 'list' ? (
          <FlatList
            data={listEvents}
            keyExtractor={(e) => e.id}
            contentContainerStyle={{ gap: sizes.gap, paddingTop: 12, paddingBottom: 12 }}
            renderItem={({ item, index }) => {
              const added = isOnMyPage(item.id);
              return (
                <FadeInView index={index}>
                <EventCard
                  event={item}
                  showDay
                  showAddress
                  note={added ? 'On my page' : skipped.includes(item.id) ? 'Skipped' : undefined}
                  right={
                    added ? (
                      <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${item.title} from my page`} onPress={() => listRemove(item.id)} />
                    ) : (
                      <SmallButton label="Add" accessibilityLabel={`Add ${item.title} to my page`} onPress={() => listAdd(item.id)} />
                    )
                  }
                />
                </FadeInView>
              );
            }}
          />
        ) : (
        <View style={styles.deck}>
          {current ? (
            <>
              {next && (
                <View style={styles.behind}>
                  <EventFace event={next} />
                </View>
              )}
              <SwipeCard
                key={current.id}
                ref={cardRef}
                event={current}
                onSwiped={handleSwiped}
              />
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>That's all for now</Text>
              <Text style={styles.emptyText}>New events show up when the organisers add them. You can also go through the skipped ones again.</Text>
              <AppButton label="Start over" onPress={startOver} />
            </View>
          )}
        </View>
        )}
      </View>

      {mode === 'cards' && current && (
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <ActionPill label="✕  Skip" onPress={() => cardRef.current?.swipe('left')} />
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
            <ActionPill label="♥  Add" filled onPress={() => cardRef.current?.swipe('right')} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segBtn, active && styles.segActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionPill({ label, filled = false, onPress }: { label: string; filled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.pill, filled ? styles.pillFilled : styles.pillOutline]}>
      <Text style={[styles.pillText, { color: filled ? colors.onPrimary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: sizes.margin },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
  },
  segBtn: { flex: 1, height: sizes.minTouch - 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: colors.surface },
  segText: { fontSize: 16, fontWeight: '500', color: colors.muted },
  segTextActive: { fontWeight: '700', color: colors.primary },
  deck: { flex: 1, marginTop: 14, marginBottom: 8 },
  behind: {
    position: 'absolute',
    top: 14,
    left: 10,
    right: 10,
    bottom: -4,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    opacity: 0.9,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: sizes.margin, paddingTop: 6, paddingBottom: 14 },
  pill: { height: sizes.buttonPrimary, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillFilled: { backgroundColor: colors.primary },
  pillOutline: { borderWidth: 1.5, borderColor: colors.outline },
  pillText: { fontSize: 16, fontWeight: '700' },
  undo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  undoText: { fontSize: 22, color: colors.muted },
  empty: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', marginBottom: 8 },
});
