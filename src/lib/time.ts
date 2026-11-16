// Time logic shared by the server render and the browser.
// The site is static, so "open now" and "running today" are re-checked in the
// visitor's browser, always in Lviv's time zone.

export const TIME_ZONE = 'Europe/Kyiv';
export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type DayHours = { closed: boolean; open: string; close: string };
export type Holiday = { date: string; label: string };

export type ZonedNow = { date: string; minutes: number; dayIndex: number };

/** Current date (YYYY-MM-DD), minutes since midnight and weekday (0 = Monday) in Lviv. */
export function nowInLviv(at: Date = new Date()): ZonedNow {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    dayIndex,
  };
}

/** A date from a content file (parsed as UTC midnight) as YYYY-MM-DD. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const isOpenDay = (h: DayHours | undefined) => !!h && !h.closed && !!h.open && !!h.close;
const overnight = (h: DayHours) => toMinutes(h.close) <= toMinutes(h.open);

export function isOfferRunning(start: string, end: string, today: string) {
  return start <= today && today <= end;
}

export type OpenStatus = { open: boolean; headline: string; detail: string };

export function openStatus(hours: DayHours[], holidays: Holiday[], now: ZonedNow): OpenStatus {
  const holidayOn = (date: string) => holidays.find((h) => h.date === date);
  const yesterday = addDays(now.date, -1);
  const yIdx = (now.dayIndex + 6) % 7;
  const y = hours[yIdx];

  // Still open from yesterday's late shift (closing after midnight)?
  if (isOpenDay(y) && overnight(y) && !holidayOn(yesterday) && now.minutes < toMinutes(y.close)) {
    return { open: true, headline: 'Open now', detail: `until ${y.close}` };
  }

  const today = hours[now.dayIndex];
  const todayHoliday = holidayOn(now.date);
  if (!todayHoliday && isOpenDay(today)) {
    const o = toMinutes(today.open);
    const c = toMinutes(today.close);
    if (now.minutes >= o && (overnight(today) || now.minutes < c)) {
      const soon = !overnight(today) && c - now.minutes <= 30;
      return { open: true, headline: soon ? 'Closing soon' : 'Open now', detail: `until ${today.close}` };
    }
    if (now.minutes < o) {
      return { open: false, headline: 'Closed now', detail: `opens today at ${today.open}` };
    }
  }

  for (let i = 1; i <= 14; i++) {
    const date = addDays(now.date, i);
    const idx = (now.dayIndex + i) % 7;
    if (holidayOn(date) || !isOpenDay(hours[idx])) continue;
    const when = i === 1 ? 'tomorrow' : DAY_NAMES[idx];
    return {
      open: false,
      headline: todayHoliday ? `Closed today${todayHoliday.label ? ` · ${todayHoliday.label}` : ''}` : 'Closed now',
      detail: `opens ${when} at ${hours[idx].open}`,
    };
  }
  return { open: false, headline: 'Closed now', detail: '' };
}
