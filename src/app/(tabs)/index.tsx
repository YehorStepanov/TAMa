import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { CardAction } from '@/components/CardAction';
import { EventCard } from '@/components/EventCard';
import { FadeInView } from '@/components/FadeInView';
import { MemoryCard } from '@/components/MemoryCard';
import { Screen, useTabSpace } from '@/components/Screen';
import { ServerStatus } from '@/components/ServerStatus';
import { StatChips } from '@/components/StatChips';
import { useEvents } from '@/context/EventsContext';
import { photoStatus } from '@/data/events';
import { longDate, monthName } from '@/lib/format';
import { colors, sizes, r } from '@/theme';

type View_ = 'upcoming' | 'calendar' | 'past';
const WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Le settimane di un mese, con il lunedì come primo giorno. Le caselle vuote sono `null`.
function buildMonth(year: number, month: number): (Date | null)[][] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

function openEvent(id: string) {
  router.push({ pathname: '/mission', params: { id } });
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// My events: i tuoi eventi in arrivo, il calendario del mese e il tuo passato (sfide fatte ed eventi persi).
export default function MyEventsScreen() {
  const { allEvents, myEvents, calendarEvents, attendedEvents, isOnMyPage, isCompleted, addToMyPage, removeFromMyPage, loading, error, refresh, refreshing, points, streak, reactionsReceived } = useEvents();
  const tabSpace = useTabSpace();
  const [view, setView] = useState<View_>('upcoming');
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(key(today));
  const now = Date.now();

  const noData = allEvents.length === 0 && (loading || error);

  // ---- In arrivo: in corso, in arrivo e appena finiti (a parte, con la foto ancora da inviare) ----
  const nowOn = myEvents.filter((e) => e.startsAt.getTime() <= now && e.endsAt.getTime() >= now);
  const comingUp = myEvents.filter((e) => e.startsAt.getTime() > now);
  const justEnded = myEvents.filter((e) => e.endsAt.getTime() < now).sort((a, b) => b.endsAt.getTime() - a.endsAt.getTime());

  // ---- Calendario: tutti gli eventi del mese (i tuoi hanno il ✓) ----
  const byDay = new Map<string, typeof allEvents>();
  allEvents.forEach((e) => byDay.set(key(e.startsAt), [...(byDay.get(key(e.startsAt)) ?? []), e]));
  const dayEvents = byDay.get(selected) ?? [];
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  // ---- Passato ----
  const missed = calendarEvents.filter((e) => e.endsAt.getTime() < now && !isCompleted(e.id) && isOnMyPage(e.id)).sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My events</Text>
        <StatChips />
      </View>
      <View style={styles.modes}>
        {(['upcoming', 'calendar', 'past'] as View_[]).map((m) => (
          <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: view === m }} onPress={() => setView(m)} style={[styles.modeBtn, view === m && styles.modeActive]}>
            <Text style={[styles.modeText, view === m && styles.modeTextActive]}>{m === 'upcoming' ? 'Upcoming' : m === 'calendar' ? 'Calendar' : 'Past'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: sizes.margin, paddingBottom: tabSpace, gap: sizes.gap }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}>
        {noData ? (
          <ServerStatus variant="list" />
        ) : view === 'upcoming' ? (
          <>
            {myEvents.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyText}>Swipe right on the events you like in Discover and they'll show up here.</Text>
                <View style={{ marginTop: 8 }}>
                  <AppButton label="Find events" onPress={() => router.navigate('/discover')} />
                </View>
              </View>
            )}
            {nowOn.length > 0 && <Text style={styles.label}>HAPPENING NOW</Text>}
            {nowOn.map((e, i) => (
              <FadeInView key={e.id} index={i}>
                <EventCard
                  event={e}
                  showDay
                  note={isCompleted(e.id) ? "Done ✓ Tap to see everyone's photos" : 'On now · take the challenge!'}
                  onPress={() => (isCompleted(e.id) ? router.push({ pathname: '/instants', params: { id: e.id } }) : openEvent(e.id))}
                  right={<CardAction tone="remove" label={`Remove ${e.title} from my events`} onPress={() => removeFromMyPage(e.id)} />}
                />
              </FadeInView>
            ))}
            {comingUp.length > 0 && <Text style={[styles.label, nowOn.length > 0 && { marginTop: 8 }]}>COMING UP</Text>}
            {comingUp.map((e, i) => (
              <FadeInView key={e.id} index={i}>
                <EventCard event={e} showDay onPress={() => openEvent(e.id)} right={<CardAction tone="remove" label={`Remove ${e.title} from my events`} onPress={() => removeFromMyPage(e.id)} />} />
              </FadeInView>
            ))}
            {justEnded.length > 0 && <Text style={[styles.label, { marginTop: 8 }]}>JUST ENDED</Text>}
            {justEnded.map((e, i) => (
              <FadeInView key={e.id} index={i}>
                <EventCard
                  event={e}
                  showDay
                  note={isCompleted(e.id) ? "Done ✓ Tap to see everyone's photos" : photoStatus(e) === 'open' ? 'Ended · you can still send your photo' : 'Photo window closed'}
                  onPress={() => (isCompleted(e.id) ? router.push({ pathname: '/instants', params: { id: e.id } }) : openEvent(e.id))}
                  right={<CardAction tone="remove" label={`Remove ${e.title} from my events`} onPress={() => removeFromMyPage(e.id)} />}
                />
              </FadeInView>
            ))}
          </>
        ) : view === 'calendar' ? (
          <>
            <View style={styles.monthRow}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => shift(-1)} style={styles.arrow}>
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
              <Text style={styles.month}>{monthName(month.getFullYear(), month.getMonth())}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => shift(1)} style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
            </View>
            <View>
              <View style={styles.weekRow}>
                {WEEK.map((d) => (
                  <Text key={d} style={styles.weekday}>
                    {d}
                  </Text>
                ))}
              </View>
              {buildMonth(month.getFullYear(), month.getMonth()).map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((d, di) => {
                    if (!d) return <View key={di} style={styles.cell} />;
                    const k = key(d);
                    const events = byDay.get(k) ?? [];
                    const cover = events.find((e) => e.coverUrl)?.coverUrl;
                    const mine = events.some((e) => isOnMyPage(e.id) || isCompleted(e.id));
                    const isToday = k === key(today);
                    const isSel = k === selected;
                    return (
                      <Pressable
                        key={di}
                        accessibilityRole="button"
                        accessibilityLabel={`${longDate(d)}${events.length ? `, ${events.length} events` : ''}`}
                        onPress={() => setSelected(k)}
                        style={[styles.cell, styles.cellBox, events.length > 0 && styles.cellEvents, isToday && styles.cellToday, isSel && styles.cellSelected]}>
                        {cover ? <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
                        <Text style={[styles.cellText, cover ? styles.cellTextOnImage : null]}>{d.getDate()}</Text>
                        {mine && <Text style={styles.cellTick}>✓</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
            <Text style={styles.subtitle}>{longDate(parseKey(selected))}</Text>
            {dayEvents.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No events on this day.</Text>
              </View>
            ) : (
              dayEvents.map((e) =>
                isCompleted(e.id) ? (
                  <MemoryCard key={e.id} event={e} onPress={() => router.push({ pathname: '/memory', params: { id: e.id } })} />
                ) : (
                  <EventCard
                    key={e.id}
                    event={e}
                    onPress={() => openEvent(e.id)}
                    right={
                      isOnMyPage(e.id) ? (
                        <CardAction tone="remove" label={`Remove ${e.title} from my events`} onPress={() => removeFromMyPage(e.id)} />
                      ) : (
                        <CardAction tone="add" label={`Add ${e.title} to my events`} onPress={() => addToMyPage(e.id)} />
                      )
                    }
                  />
                ),
              )
            )}
          </>
        ) : (
          <>
            <View style={styles.stats}>
              <Stat emoji="⭐" value={points} label="points" />
              <Stat emoji="🔥" value={streak} label={streak === 1 ? 'week' : 'weeks'} />
              <Stat emoji="🎯" value={attendedEvents.length} label="challenges" />
              <Stat emoji="❤️" value={reactionsReceived} label="reactions" />
            </View>
            <Text style={styles.hint}>Each challenge earns points, and every reaction on your photos gives you 5 more. Do at least one challenge a week to keep your streak going.</Text>

            <Text style={styles.label}>YOUR CHALLENGES</Text>
            {attendedEvents.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No challenges yet</Text>
                <Text style={styles.emptyText}>Go to an event, take on a challenge and send a photo. It will show up here.</Text>
              </View>
            ) : (
              attendedEvents.map((e) => <MemoryCard key={e.id} event={e} onPress={() => router.push({ pathname: '/memory', params: { id: e.id } })} />)
            )}

            {missed.length > 0 && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>EVENTS YOU MISSED</Text>
                {missed.map((e) => (
                  <EventCard key={e.id} event={e} showDay note={photoStatus(e) === 'open' ? 'You can still send your photo!' : 'The photo window is closed'} onPress={() => openEvent(e.id)} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function parseKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m, d);
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: sizes.margin, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  modes: { flexDirection: 'row', marginHorizontal: sizes.margin, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: r(999), padding: 3 },
  modeBtn: { flex: 1, minHeight: 44, borderRadius: r(999), alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: colors.surface },
  modeText: { fontSize: 16, fontWeight: '600', color: colors.muted },
  modeTextActive: { color: colors.primary, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 0.8, color: colors.muted },
  subtitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 },
  empty: { backgroundColor: colors.glass, borderRadius: r(20), borderWidth: 1, borderColor: colors.glassBorder, padding: 18, gap: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 17, lineHeight: 24, color: colors.muted },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 22, fontWeight: '700', color: colors.text },
  arrow: { width: 48, height: 48, borderRadius: r(24), backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: -3 },
  weekRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.muted },
  cell: { flex: 1, aspectRatio: 0.8 },
  cellBox: { borderRadius: r(12), borderWidth: 1.5, borderColor: 'rgba(22,33,44,0.3)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cellEvents: { backgroundColor: 'rgba(22,33,44,0.25)' },
  cellToday: { borderColor: colors.primary, borderWidth: 2.5 },
  cellSelected: { borderColor: colors.primary, borderWidth: 4 },
  cellText: { fontSize: 17, fontWeight: '700', color: colors.text },
  cellTextOnImage: { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  cellTick: { position: 'absolute', right: 3, bottom: 1, fontSize: 13, fontWeight: '700', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.glass, borderRadius: r(20), borderWidth: 1, borderColor: colors.glassBorder, paddingVertical: 12, alignItems: 'center' },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 26, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  hint: { fontSize: 16, lineHeight: 22, color: colors.muted, paddingHorizontal: 4 },
});
