import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Tri-state attribute. "unknown" must NEVER render as "no".
 * If we have not confirmed it from a primary source, it is unknown.
 */
const triState = z.enum(['yes', 'no', 'unknown']).default('unknown');

/** Field-level evidence. Every non-obvious fact should cite one. */
const source = z.object({
  url: z.string().url(),
  label: z.string(),
  checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
  note: z.string().optional(),
});

const hours = z.object({
  mon: z.string().optional(),
  tue: z.string().optional(),
  wed: z.string().optional(),
  thu: z.string().optional(),
  fri: z.string().optional(),
  sat: z.string().optional(),
  sun: z.string().optional(),
});

const bakeries = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/bakeries' }),
  schema: z.object({
    // identity
    name: z.string(),
    slug: z.string(),
    businessId: z.string(),

    // status, kept separate on purpose
    publication: z.enum(['draft', 'review', 'published']).default('draft'),
    operational: z
      .enum(['operating', 'temporarily_closed', 'permanently_closed', 'unknown'])
      .default('unknown'),

    // location
    street: z.string().optional(),
    city: z.string(),
    state: z.string().default('MI'),
    zip: z.string().optional(),
    neighborhood: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),

    // contact
    phone: z.string().optional(),
    website: z.string().url().optional(),
    orderUrl: z.string().url().optional(),
    instagram: z.string().optional(),

    // editorial
    summary: z.string(),
    founded: z.number().optional(),
    tags: z.array(z.string()).default([]),

    // the decision facts, which are the entire point of this site
    hours: hours.optional(),
    hoursNote: z.string().optional(),
    customCakes: triState,
    customCakeLeadTime: z.string().optional(),
    customCakeProcess: z.string().optional(),
    paczki: triState,
    paczkiYearRound: triState,
    vegan: triState,
    glutenFree: triState,
    halal: triState,
    openSunday: triState,
    seating: triState,
    delivery: triState,
    dietaryNote: z.string().optional(),

    // published price examples, dated, never estimated
    priceExamples: z
      .array(z.object({ item: z.string(), price: z.string(), asOf: z.string() }))
      .default([]),

    // provenance
    sources: z.array(source).min(1, 'every profile needs at least one source'),
    verifiedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.boolean().default(false),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sources: z.array(source).default([]),
  }),
});

export const collections = { bakeries, guides };
