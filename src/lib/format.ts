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

// "Sat 28/11"
export function shortDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

// "7 PM", "9:30 AM"
export function clock(d: Date): string {
  const x = parts(d);
  return `${x.hour}${x.minutes} ${x.mer}`;
}

// Orario completo: "7–9 PM" se finisce lo stesso giorno, altrimenti "11 AM → Sat 28/11, 10 PM" (evento di più giorni).
export function eventTime(a: Date, b: Date): string {
  return sameDay(a, b) ? timeRange(a, b) : `${clock(a)} → ${shortDate(b)}, ${clock(b)}`;
}

// "7–9 PM" oppure "9 PM–2 AM".
export function timeRange(a: Date, b: Date): string {
  const x = parts(a);
  const y = parts(b);
  const start = `${x.hour}${x.minutes}`;
  const end = `${y.hour}${y.minutes} ${y.mer}`;
  return x.mer === y.mer ? `${start}–${end}` : `${start} ${x.mer}–${end}`;
}

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Friday, 27 November"
export function longDate(d: Date): string {
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// "NOV"
export function monthShort(d: Date): string {
  return MONTHS[d.getMonth()].slice(0, 3).toUpperCase();
}

export function monthName(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

const two = (n: number) => String(n).padStart(2, '0');

// "14:00 – 16:00"
export function time24(a: Date, b: Date): string {
  return `${two(a.getHours())}:${two(a.getMinutes())} – ${two(b.getHours())}:${two(b.getMinutes())}`;
}
