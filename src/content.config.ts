import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every collection here is edited in the admin at /keystatic.
// Keep keystatic.config.ts in step with any change made here.

export const CATEGORIES = ['classic', 'signature', 'white'] as const;
export const LABELS = ['spicy', 'vegetarian', 'new'] as const;
export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const pizzas = defineCollection({
  loader: glob({ base: './src/content/pizzas', pattern: '**/*.yaml' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      category: z.enum(CATEGORIES),
      order: z.number().int().default(0),
      description: z.string(),
      price30: z.number(),
      price40: z.number(),
      ingredients: z.array(z.string()).default([]),
      photo: image(),
      photoAlt: z.string().default(''),
      labels: z.array(z.enum(LABELS)).default([]),
      available: z.boolean().default(true),
    }),
});

const offers = defineCollection({
  loader: glob({ base: './src/content/offers', pattern: '**/*.yaml' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    badge: z.string().default(''),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    pizza: reference('pizzas').nullable().optional(),
  }),
});

const reviews = defineCollection({
  loader: glob({ base: './src/content/reviews', pattern: '**/*.yaml' }),
  schema: z.object({
    author: z.string(),
    rating: z.number().int().min(1).max(5),
    text: z.string(),
    date: z.coerce.date(),
    approved: z.boolean().default(false),
  }),
});

const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^$/, { error: 'Use 24-hour time like 11:00' });
const dayHours = z.object({
  closed: z.boolean().default(false),
  open: timeString.default(''),
  close: timeString.default(''),
});

const info = defineCollection({
  loader: glob({ base: './src/content/site', pattern: 'info.yaml' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    address: z.string(),
    city: z.string(),
    phone: z.string(),
    email: z.string().default(''),
    mapUrl: z.url(),
    instagram: z.string().default(''),
    pizzaOfTheWeek: reference('pizzas').nullable().optional(),
    pizzaOfTheWeekNote: z.string().default(''),
    hours: z.object(Object.fromEntries(DAYS.map((d) => [d, dayHours])) as Record<(typeof DAYS)[number], typeof dayHours>),
    holidays: z
      .array(z.object({ date: z.coerce.date(), label: z.string().default('') }))
      .default([]),
  }),
});

const history = defineCollection({
  loader: glob({ base: './src/content/site', pattern: 'history.yaml' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    milestones: z
      .array(z.object({ year: z.number().int(), title: z.string(), text: z.string() }))
      .default([]),
  }),
});

export const collections = { pizzas, offers, reviews, info, history };
