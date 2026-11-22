const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// "Today", "Tomorrow" o "Sat 29/11".
export function dayLabel(d: Date, now = new Date()): string {
  if (sameDay(d, now)) return 'Today';
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function parts(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  return { hour: h % 12 === 0 ? 12 : h % 12, minutes: m === 0 ? '' : `:${String(m).padStart(2, '0')}`, mer: h < 12 ? 'AM' : 'PM' };
}

// "7–9 PM" oppure "9 PM–2 AM".
export function timeRange(a: Date, b: Date): string {
  const x = parts(a);
  const y = parts(b);
  const start = `${x.hour}${x.minutes}`;
  const end = `${y.hour}${y.minutes} ${y.mer}`;
  return x.mer === y.mer ? `${start}–${end}` : `${start} ${x.mer}–${end}`;
}
