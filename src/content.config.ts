import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * Keep the locale suffix in entry ids. Without this, `foo.id.md` and
 * `foo.en.md` both slugify to `foo` and Astro warns about duplicate slugs.
 */
const keepLocaleId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

const lang = z.enum(['id', 'en']);
const seo = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
});

/** Products — schema is complete now; specification content is filled in later. */
const products = defineCollection({
  loader: file('./src/content/products/products.json'),
  schema: z.object({
    lang,
    ref: z.string(), // pairs the ID/EN entries
    slug: z.string(),
    order: z.number().default(99),
    title: z.string(),
    category: z.enum(['sparepart', 'equipment-facility', 'general-equipment', 'operational-supplies']),
    summary: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    brand: z.string().optional(),
    model: z.string().optional(),
    productCode: z.string().optional(),
    application: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    pertaminaRelated: z.boolean().default(false),
    image: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    availability: z.enum(['in-stock', 'on-request', 'project-based']).default('on-request'),
    draft: z.boolean().default(false),
    seo: seo.optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services', generateId: keepLocaleId }),
  schema: z.object({
    lang,
    ref: z.string(),
    slug: z.string(),
    order: z.number().default(99),
    title: z.string(),
    summary: z.string(),
    scope: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    icon: z.string().default('wrench'),
    draft: z.boolean().default(false),
    seo: seo.optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects', generateId: keepLocaleId }),
  schema: z.object({
    lang,
    ref: z.string(),
    order: z.number().default(99),
    title: z.string(),
    sector: z.enum(['spbu-energy', 'industry', 'construction', 'maintenance']),
    workType: z.enum([
      'totem-renovation',
      'totem-foundation-pole',
      'facility-support',
      'repair',
      'certification',
      'console-service',
      'atg-seftibar',
    ]),
    /**
     * MUST be a generic industry label (e.g. "SPBU Retail Network").
     * Never a company name or SPBU unit code — enforced by the build check
     * in scripts/check-no-client-names.mjs.
     */
    clientLabel: z.string(),
    location: z.string().optional(),
    year: z.string().optional(),
    images: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    seo: seo.optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles', generateId: keepLocaleId }),
  schema: z.object({
    lang,
    ref: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.enum([
      'product-knowledge',
      'spbu-equipment-components',
      'maintenance-facility',
      'spbu-safety-compliance',
      'product-selection-tips',
      'renovation-facility',
      'industry-regulatory-update',
      'project-insight',
      'company-product-update',
    ]),
    author: z.string().default('JTech'),
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    draft: z.boolean().default(false),
    seo: seo.optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials', generateId: keepLocaleId }),
  schema: z.object({
    lang,
    ref: z.string(),
    order: z.number().default(99),
    quote: z.string(),
    /** Generic role/industry label only — never a client name. */
    attribution: z.string(),
    sector: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { products, services, projects, articles, testimonials };
