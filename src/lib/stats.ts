// Punti e serie settimanale: si calcolano dai dati veri (foto inviate e reazioni ricevute), non sono numeri salvati a parte.
export const POINTS_PER_REACTION = 5;

// Il lunedì (a mezzanotte) della settimana che contiene `d`.
function weekStart(d: Date): number {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.getTime();
}

// Quante settimane di fila (fino a questa) hai fatto almeno una sfida.
// Se questa settimana non ne hai ancora fatta nessuna, la serie resta viva finché la settimana non finisce.
export function weeklyStreak(dates: Date[], now = new Date()): number {
  const weeks = new Set(dates.map(weekStart));
  const cursor = new Date(weekStart(now));
  if (!weeks.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
  let count = 0;
  while (weeks.has(cursor.getTime())) {
    count++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return count;
}
