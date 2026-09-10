import { getCollection, type CollectionEntry } from 'astro:content';

export type Bakery = CollectionEntry<'bakeries'>;
export type Tri = 'yes' | 'no' | 'unknown';

/** Only published, operating profiles ever reach the public site. */
export async function getPublishedBakeries(): Promise<Bakery[]> {
  const all = await getCollection('bakeries');
  return all
    .filter((b) => b.data.publication === 'published' && b.data.operational === 'operating')
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export function placeLabel(d: Bakery['data']): string {
  if (d.neighborhood && d.city === 'Detroit') return `${d.neighborhood}, Detroit`;
  return d.city;
}

export function fullAddress(d: Bakery['data']): string | null {
  if (!d.street) return null;
  return [d.street, `${d.city}, ${d.state}${d.zip ? ' ' + d.zip : ''}`].join(', ');
}

export function directionsUrl(d: Bakery['data']): string | null {
  const addr = fullAddress(d);
  if (!addr) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${d.name}, ${addr}`
  )}`;
}

export function telHref(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+1${digits}` : null;
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABEL: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function hoursRows(h?: Record<string, string | undefined>) {
  if (!h) return [];
  return DAY_ORDER.filter((d) => h[d]).map((d) => ({ day: DAY_LABEL[d], value: h[d] as string }));
}

/** schema.org openingHours needs day codes, only emit what we actually know. */
export function openingHoursSpec(h?: Record<string, string | undefined>) {
  if (!h) return undefined;
  const map: Record<string, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  };
  const spec = DAY_ORDER.filter((d) => h[d] && !/closed/i.test(h[d] as string)).map((d) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: map[d],
    description: h[d],
  }));
  return spec.length ? spec : undefined;
}

/** Human label for a tri-state. "unknown" must never read as "no". */
export function triLabel(v: Tri, yes: string, no: string): { text: string; known: boolean } {
  if (v === 'yes') return { text: yes, known: true };
  if (v === 'no') return { text: no, known: true };
  return { text: 'Not confirmed', known: false };
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Fat Tuesday, which is 47 days before Easter. */
export function paczkiDay(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(Date.UTC(year, month - 1, day));
  return new Date(easter.getTime() - 47 * 86400000);
}

export function nextPaczkiDay(from = new Date()): Date {
  const thisYear = paczkiDay(from.getUTCFullYear());
  return thisYear >= from ? thisYear : paczkiDay(from.getUTCFullYear() + 1);
}

export function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
