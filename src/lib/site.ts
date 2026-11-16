import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { DAY_KEYS, isoDate, type DayHours, type Holiday } from './time';

export const CATEGORY_INFO = {
  classic: { title: 'Classic', blurb: 'The Neapolitan favourites, done the traditional way.' },
  signature: { title: 'Signature', blurb: 'Our own recipes, with ingredients from Lviv and the Carpathians.' },
  white: { title: 'White pizzas', blurb: 'No tomato — cream, cheese and something special.' },
} as const;

export const LABEL_INFO = {
  spicy: { text: 'Spicy', icon: '🌶' },
  vegetarian: { text: 'Vegetarian', icon: '🌿' },
  new: { text: 'New', icon: '✦' },
} as const;

export type Pizza = CollectionEntry<'pizzas'>;

export async function getInfo() {
  const entry = await getEntry('info', 'info');
  if (!entry) throw new Error('Missing src/content/site/info.yaml');
  return entry.data;
}

export async function getPizzas() {
  const order = Object.keys(CATEGORY_INFO);
  return (await getCollection('pizzas')).sort(
    (a, b) =>
      order.indexOf(a.data.category) - order.indexOf(b.data.category) ||
      a.data.order - b.data.order ||
      a.data.name.localeCompare(b.data.name),
  );
}

export const formatPrice = (n: number) => `${n} ₴`;

export function hoursList(info: Awaited<ReturnType<typeof getInfo>>): DayHours[] {
  return DAY_KEYS.map((k) => info.hours[k]);
}

export function holidayList(info: Awaited<ReturnType<typeof getInfo>>): Holiday[] {
  return info.holidays
    .map((h) => ({ date: isoDate(h.date), label: h.label }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
