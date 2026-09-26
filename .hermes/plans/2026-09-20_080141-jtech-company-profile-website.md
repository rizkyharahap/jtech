# JTech Company Profile Website — Implementation Plan

> **For Hermes:** Phase 1 deliverable = this plan + repo skeleton. No implementation yet.
> Phase 2 (`AGENT_INSTRUCTIONS.md`) is generated **only after** Rizki approves this plan.

**Status:** Phases 1–4 delivered and Lighthouse-verified. **Design revised: theme changed
to LIGHT-ONLY** (owner dislikes dark/black backgrounds; single mode, no dark-mode concept).
Prototype re-skinned and re-verified. Remaining: port palette to Astro source, then Phase 5 deploy (Task 18).
**Goal:** Build a bilingual (ID/EN), statically-generated company-profile + catalog website for PT JTech Lawang Perkasa — gold/navy industrial-premium on light, inspired by alldataint.com's *structure* but with a distinct palette, shape language and imagery.

**Architecture:** Astro 7 SSG only (zero server runtime). All content in Astro Content Collections (typed frontmatter, no CMS, no DB). Tailwind 4 via the official Vite plugin with design tokens in `@theme`. Every interactive element (nav, language toggle, filter chips) is a hand-written Astro component with inline `<script>` where needed — **no UI library, no client framework, no hydrated island**.

**Tech Stack (5 packages, pinned):**

| Package | Version | Why |
|---|---|---|
| `astro` | `^7.3.3` | SSG, content collections, image optimization, fonts |
| `tailwindcss` | `^4.3.3` | styling |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind 4 integration (peer: vite ^8, Astro 7 bundles vite ^8.0.13 ✓) |
| `@astrojs/sitemap` | `^3.7.4` | sitemap + hreflang alternates |
| `typescript` | `^5.9.3` (dev) | content schema typecheck |

**Deliberately NOT installed:** any UI/component library, shadcn, React/Vue/Svelte, AOS/animation lib, icon package (inline SVG instead), `@fontsource/*` (Astro 7 has a native Fonts API), `sharp` (ships as Astro's default image service), `@astrojs/tailwind` (legacy, Tailwind 3 only), `@astrojs/check` (gate is `astro build` instead).

---

## 0. Decisions locked (from interview)

| Question | Answer | Consequence |
|---|---|---|
| Language | **Bilingual ID + EN with toggle** | two mirrored page sets, content pairs by `ref`, `<link rel=alternate hreflang>` |
| Deploy | **Base-agnostic** | every internal link via `import.meta.env.BASE_URL`; no hardcoded `/`; works at `/` (Vercel) and `/repo/` (GH Pages) with zero code change |
| Visual theme | **Light-only (single mode)** | all sections light (white / bone / navy-50); navy is TEXT colour only. No dark sections, no dark-mode toggle. |
| Product spec data | **Not available yet** | full schema + catalog structure now, content filled later; product photos are placeholders |
| Client names | **Do not publish** | generic industry labels only ("SPBU / Retail Fuel", "Kontraktor Migas", "Perusahaan Logistik"). The 31 SPBU codes and "PT Citra Buana Indoloka" appear in **no** published output — they may live only in an internal, unrendered note. |

---

## 1. Brand & Design System (the "different from alldataint" answer)

### 1.1 What the reference site actually is (measured, not guessed)

`https://alldataint.com/` — Bootstrap 5, `--bs-primary: #008bf9` (bright cyan-blue), white nav, **pill buttons** (`border-radius: 800px`), Plus Jakarta Sans body + Outfit headings, 11 stacked sections, AOS fade-ins, Hotjar + GTM installed.

**Sections:** hero → intro/value → services → why-choose-us → solutions → partnerships → principal → testimonials → articles → CTA → footer.

### 1.2 What JTech actually has (measured from the assets)

- **56 assets:** 47 SPBU project photos in `resources/images/` (real totem + signage renovation work, daylight/blue-sky) + 1 logo, plus 8 testimonial images in `resources/images/testimony/`.
- **Testimonials (`resources/images/testimony/`, 8 files):** all `739×1600` phone aspect, **dark-mode WhatsApp screenshot** captures (dark pixel share 29–69%, ≤1.7% white). These are chat screenshots, not clean quotes → they must be presented inside a phone-frame card on a **dark** section, or transcribed to text quotes (see Risk R4).
- **Logo (`LOGO JTECH.jpg`, 1264×1276):** a **gold ring/globe emblem with connecting network nodes**, containing the black wordmark `JTECH` and `LAWANG PERKASA` beneath, all enclosed in a circular laurel/wreath border. Background is white; it is a JPEG — **no transparency, no vector, no dark-background variant**.

**Extracted brand palette (pixel-frequency + saturation analysis):**

| Token | Hex | Where it came from |
|---|---|---|
| Brand gold | `#DAC967` | 4.7% of logo pixels, hue 39–60° — the emblem's gold |
| Deep gold | `#B0A256` | mid-lightness gold cluster |
| Wordmark ink | `#080808` / `#181818` | 3.3% + 2.2% of logo pixels |
| Background | `#F8F8F8` | 78.3% (paper white) |

**Conclusion:** the brand is unambiguously **black + gold**. The site must be gold/charcoal, never the reference site's bright blue.

### 1.3 Design tokens (contrast-verified)

All pairs below were computed with the WCAG relative-luminance formula — ratios are real, not estimates.

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* --- Typography: Astro Fonts API injects --font-body / --font-display --- */
  --font-sans:    var(--font-body), ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-display), ui-sans-serif, system-ui, sans-serif;

  /* --- Ink: charcoal, NOT pure black (photography sits on it better) --- */
  /* SUPERSEDED: the ink-* dark scale was replaced by the navy-* scale below.
     Kept only to show the original intent. */
  --color-ink-950: #0B0F12;   /* (old) page dark bg, footer */
  --color-ink-900: #12171B;   /* (old) dark section bg      */
  --color-ink-800: #1B2228;   /* dark cards / elevated      */
  --color-ink-700: #2A3239;   /* dark borders, dark text on light */
  --color-ink-600: #47525B;   /* secondary text on light    */
  --color-ink-400: #8A949C;   /* muted text on dark, on light = large only */
  --color-ink-200: #C9CFD3;   /* dark-section body text     */
  --color-ink-100: #E7EAEC;   /* light hairlines            */

  /* --- Bone: warm off-white, not #fff (pairs with gold, softer than alldataint) --- */
  --color-bone-50:  #FBFAF7;
  --color-bone-100: #F4F2EC;
  --color-bone-200: #E6E2D8;  /* light borders */

  /* --- Gold family, derived from the logo --- */
  --color-gold-300: #EAE1AC;  /* gold tint text on dark      */
  --color-gold-400: #E0D187;
  --color-gold-500: #DAC967;  /* ★ PRIMARY — the logo gold   */
  --color-gold-600: #BFA84A;  /* hover / pressed on dark     */
  --color-gold-700: #8F7A28;  /* large text on light only    */
  --color-gold-800: #6B5C1D;  /* ★ GOLD TEXT ON LIGHT        */
  --color-gold-900: #4A4013;  /* gold-tinted dark surfaces   */
}
```

**Verified contrast (use these rules, they are not stylistic preferences):**

| Combination | Ratio | Verdict |
|---|---|---|
| `ink-900` on `bone-50` | **17.28** | AAA body |
| `ink-600` on `bone-50` | **7.66** | AAA body |
| `gold-800` on `bone-50` | **6.34** | ✅ the only gold allowed as body text on light |
| `gold-700` on `bone-50` | 4.04 | large text / icons only — **fails** for small text |
| `gold-500` on `bone-50` | 1.61 | ❌ decorative only, never text on light |
| `gold-500` on `ink-900` | **10.77** | ✅ gold is a *dark-background* text/accent colour |
| `gold-400` on `ink-900` | **11.72** | ✅ |
| `gold-700` on `ink-900` | 4.28 | ⚠️ avoid; use 500/400 on dark |
| `white` on `ink-900` | **18.04** | AAA |
| `ink-200` on `ink-950` | **12.23** | AAA body on dark |
| `ink-400` on `ink-900` | 5.84 | ✅ muted text on dark |
| `ink-900` on `gold-500` (button) | **10.77** | ✅ primary button = ink text on gold fill |
| `white` on `gold-600` | 2.26 | ❌ never use gold fills with white text |

**Non-negotiable rules that fall out of the table:**
1. Primary button = `bg-gold-500 text-ink-950` (never white-on-gold).
2. Gold as *text* → `gold-500`+ on dark, `gold-800` on light. `gold-300/400` never on light.
3. Body copy on light = `ink-900` / `ink-600`; on dark = `ink-200` / `ink-400`.
4. Gold is the **accent**, ≤10% of any viewport. Ink + bone carry the layout.

### 1.4 Typography

| Role | Family | Rationale |
|---|---|---|
| Display / headings | **Outfit** 500/600/700 | geometric, industrial, tech-credible |
| Body / UI | **Plus Jakarta Sans** 400/500/600/700/800 | Indonesian-designed grotesque; also the reference site's body font, so the site reads as "same era, different company" |

Served through Astro's native **Fonts API** (`fonts: [...]` in `astro.config.mjs` → self-hosted, preloaded, no third-party request, **no font npm package**). Devanagari/Latin subsets only; `display: swap`.

Scale (fluid, no plugin):
`h1 clamp(2.5rem, 5.5vw, 4.5rem)` · `h2 clamp(1.875rem, 3.2vw, 3rem)` · `h3 1.5rem` · body `1.0625rem/1.7`. Heading tracking `-0.02em`. Eyebrow labels: `0.75rem`, `uppercase`, `tracking-[0.18em]`, `gold-800` on light / `gold-500` on dark.

### 1.5 Differentiation from alldataint.com (explicit)

| Aspect | alldataint.com | JTech |
|---|---|---|
| Palette | bright blue on white | **gold `#DAC967` on charcoal + bone** |
| Theme mode | light only | **hybrid: dark ink hero + dark project/testimonial bands, light body** |
| Corner radius | pill (`800px`) | **`2–4px`** squared/technical |
| Shape language | soft, rounded, friendly | hairline rules, gold 1px seams, blueprint-grid texture |
| Imagery | abstract tech illustrations / stock | **real SPBU totem & signage photography, full-bleed** |
| Density | 11 sections, dense | 8–9 sections, larger type, more whitespace |
| Signature detail | AOS fade-in | gold "seal" SVG divider + numbered section eyebrows (`01 / 02 / …`) |
| Credibility block | "Trusted by" logo wall | **credentials + KBLI licence register** (legal substance, not logo salad) |

**Do not copy:** visitor counters, fake partner logos, pricing tables, stock-avatar testimonial carousel, "Chat with us" live widget.

### 1.6 Section-by-section design intent (home)

| # | Section | Theme | Content source |
|---|---|---|---|
| 1 | Hero: `Business Partner for Products, Services & Project Solutions` + sub `Supporting SPBU, Energy & Business Operations.` + 2 CTAs | **dark ink-950**, full-bleed photo w/ ink scrim, gold rule | §1.2 positioning |
| 2 | Intro / value ("Supporting Business Operations") | light bone-50 | §1.1, §6 value prop |
| 3 | Fokus Bisnis — 4 numbered cards | light bone-100 | §1.5 |
| 4 | Products — 4 category cards → catalog | light bone-50 | §2 |
| 5 | Services — 6 cards → detail | **dark ink-900** | §3 |
| 6 | Projects — real photo grid + SPBU/energy experience | light bone-50 | §4 (generic labels) |
| 7 | Why Choose JTech — 6 pillars + credential strip (PT/PMDN/KBLI) | light bone-100 | §5.2, §6 |
| 8 | Testimonials | **dark ink-950** | `testimony/` |
| 9 | CTA + Contact / Request Quotation | **dark ink-950** or gold-tinted | §5.2 contact |

---

## 2. Site Map (bilingual)

Path segments are **identical in both locales** so Astro's i18n + sitemap generate correct `hreflang` pairs, and the language toggle is a pure prefix swap. Default locale (ID) at root, EN under `/en/`.

| Route (ID) | Route (EN) | Page | Requirement source |
|---|---|---|---|
| `/` | `/en/` | Home | §1 |
| `/products/` | `/en/products/` | Catalog + category filter | §2 |
| `/products/[ref]/` | `/en/products/[ref]/` | Product detail + RFQ | §2 |
| `/services/` | `/en/services/` | 6 services | §3 |
| `/services/[slug]/` | `/en/services/[slug]/` | Service detail + scope + docs | §3 |
| `/projects/` | `/en/projects/` | Portfolio: SPBU experience + other projects | §4.1, §4.2 |
| `/about/` | `/en/about/` | Profile, vision, mission, focus, credentials, KBLI | §1.1–1.5, §5.2 |
| `/clients/` | `/en/clients/` | Trusted Experience — **generic industry labels only** | §5.1, §5.3 |
| `/articles/` | `/en/articles/` | Education index | §"Educational Content" |
| `/articles/[slug]/` | `/en/articles/[slug]/` | Article + `sources[]` + date | §"Educational Content" |
| `/contact/` | `/en/contact/` | Contact details + Request Quotation form | §5.2 |

Plus `404.astro`, `robots.txt`, `sitemap-index.xml` (generated).

**Requirement → page coverage matrix** (nothing dropped): §1.1→about/home · §1.2 positioning→hero + header strapline · §1.3 vision→about · §1.4 mission→about · §1.5 focus→home + about · §2 products→catalog + detail · §3 services→services + detail · §4.1 SPBU projects→projects · §4.2 other projects→projects · §5.1 clients *labels only*→clients · §5.2 credentials + KBLI→about + why-choose strip · §5.3 trust→clients + testimonials · §6 why-choose + value prop→home + about · education (9 topics)→articles (`category` enum covers all 9).

**Requirement items that are intentionally NOT built:** no cart/checkout (RFQ-only, per §2), no user accounts, no CMS, no payment. The 31 SPBU codes are stored only in an **internal, unrendered** `src/content/_internal/spbu-project-log.md` (underscore prefix + excluded from every collection) as a factual record for future reference — never published (locked decision).

---

## 3. Content Model

`astro.config.mjs` is minimal; collections live in `src/content.config.ts` (Astro 7 path).

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lang = z.enum(['id', 'en']);
const seo = z.object({ title: z.string(), description: z.string(), image: z.string().optional() });
const cta  = z.object({ label: z.string(), href: z.string() });

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: z.object({
    lang,
    ref: z.string(),                 // pairs the ID/EN entries
    order: z.number().default(99),
    title: z.string(),
    category: z.enum(['sparepart', 'equipment-facility', 'general-equipment', 'operational-supplies']),
    summary: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    brand: z.string().optional(),
    model: z.string().optional(),
    productCode: z.string().optional(),
    application: z.array(z.string()).default([]),   // "fungsi / application produk"
    featured: z.boolean().default(false),           // SPBU/Pertamina emphasis
    pertaminaRelated: z.boolean().default(false),
    image: z.string().optional(),                   // asset key, optional until photos land
    gallery: z.array(z.string()).default([]),
    availability: z.enum(['in-stock', 'on-request', 'project-based']).default('on-request'),
    seo: seo.optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    lang, ref: z.string(), order: z.number().default(99),
    title: z.string(), summary: z.string(),
    scope: z.array(z.string()).default([]),        // ruang lingkup pekerjaan
    deliverables: z.array(z.string()).default([]),
    gallery: z.array(z.string()).default([]),      // dokumentasi project
    icon: z.string().default('wrench'),
    seo: seo.optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    lang, ref: z.string(), order: z.number().default(99),
    title: z.string(),           // e.g. "Peremajaan Totem SPBU"
    sector: z.enum(['spbu-energy', 'industry', 'construction', 'maintenance']),
    workType: z.enum(['totem-renovation', 'totem-foundation-pole', 'facility-support', 'repair', 'certification', 'console-service', 'atg-seftibar']),
    /** clientLabel must be a GENERIC industry label. Never a company name or SPBU code. */
    clientLabel: z.string(),
    location: z.string().optional(),   // region only (e.g. "Jawa Barat")
    year: z.string().optional(),
    images: z.array(z.string()).default([]),
    cover: z.string().optional(),
    body: z.string().optional(),
    seo: seo.optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    lang, ref: z.string(),
    title: z.string(), summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.enum([
      'product-knowledge', 'spbu-equipment-components', 'maintenance-facility',
      'spbu-safety-compliance', 'product-selection-tips', 'renovation-facility',
      'industry-regulatory-update', 'project-insight', 'company-product-update',
    ]),
    author: z.string().default('JTech'),
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    seo: seo.optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    lang, ref: z.string(), order: z.number().default(99),
    quote: z.string(),                 // transcribed, cleaned copy
    attribution: z.string(),           // generic role/industry label
    screenshot: z.string().optional(),
    seo: seo.optional(),
  }),
});

export const collections = { products, services, projects, articles, testimonials };
```

**File naming convention:** `src/content/<collection>/<slug>.<lang>.md` → entry id `slug.lang`. Query in both locales pages:

```ts
import { getCollection } from 'astro:content';
const items = (await getCollection('products', ({ data }) => data.lang === lang && !data.draft))
  .sort((a, b) => a.data.order - b.data.order);
```

**Bilingual pairing helper** (`src/i18n/pair.ts`): given a `ref` + current lang, find the counterpart entry (or fall back to the other locale's page / category index if untranslated) so the language toggle never 404s. Untranslated fallback is explicit, not silent.

**Seed entries in Phase 1** (structure proving, content marked `draft: true` where text is not yet final):
- 8 products: `nozzle-assembly`, `fuel-hose`, `solenoid-valve`, `fuel-filter`, `dispenser-display-panel`, `dispenser-keypad`, `pcb-board`, `apar` — all `pertaminaRelated: true`, `featured` on 3.
- 6 services: the §3 list verbatim.
- 6 projects: `totem-renovation`, `totem-foundation-pole`, `spbu-facility-support`, `bejana-repair`, `certification-service`, `atg-seftibar-service` — each with a **generic** `clientLabel` ("SPBU Retail Network", "Oil & Gas Contractor", "Industrial Fabrication").
- 4 articles: one per key education topic, each with 1–2 real `sources[]` URLs and a `publishedAt`.
- 3 testimonials: **transcribed** quotes + generic attribution.

---

## 4. File & Folder Structure

```
jtech-company-profile/
├─ .github/workflows/deploy.yml        # GitHub Pages (Phase 4)
├─ .gitignore                          # NEW (node_modules, dist, .astro, .DS_Store, .hermes/, .env)
├─ .editorconfig
├─ README.md                           # NEW — setup + deploy docs (ID + EN)
├─ astro.config.mjs                    # NEW
├─ package.json                        # NEW
├─ pnpm-lock.yaml
├─ tsconfig.json                       # NEW (astro/tsconfigs/strict)
├─ vercel.json                         # NEW (Phase 4)
├─ public/
│  ├─ favicon.svg  favicon.ico
│  ├─ logo/jtech-logo.png              # white-keyed transparent PNG (generated)
│  ├─ logo/jtech-logo-dark.png         # knockout/white variant for dark bg (generated)
│  ├─ og/og-default.jpg                # 1200×630 (generated)
│  └─ robots.txt
├─ resources/                          # SOURCE OF TRUTH, never deleted
│  ├─ REQUIREMENT.md
│  └─ images/  (47 photos + 8 testimony + logo)
├─ scripts/                            # one-off dev utilities (node, no deps beyond sharp)
│  ├─ prepare-assets.mjs               # rename/normalize photos + generate variants + OG
│  └─ key-logo.mjs                     # white→alpha keying for the logo
├─ src/
│  ├─ assets/images/<semantic-name>.jpg  # pipeline output consumed by <Image/>
│  ├─ content.config.ts
│  ├─ content/
│  │  ├─ products/*.id.md *.en.md
│  │  ├─ services/*.id.md *.en.md
│  │  ├─ projects/*.id.md *.en.md
│  │  ├─ articles/*.id.md *.en.md
│  │  ├─ testimonials/*.id.md *.en.md
│  │  └─ _internal/spbu-project-log.md   # NOT a collection — never published
│  ├─ i18n/
│  │  ├─ ui.ts        # all UI strings, { id, en }
│  │  ├─ utils.ts     # getLangFromUrl, useTranslations, switchLangUrl, localize
│  │  ├─ routes.ts    # route map + localized href builder (base-aware)
│  │  └─ pair.ts      # bilingual entry pairing + fallback
│  ├─ lib/
│  │  ├─ site.ts      # canonical site config: name, phone, email, address, KBLI, socials
│  │  ├─ url.ts       # withBase(path) → import.meta.env.BASE_URL aware
│  │  ├─ format.ts    # date/number formatting per locale
│  │  └─ schema.ts    # JSON-LD builders (Organization, LocalBusiness, Product, Article, BreadcrumbList)
│  ├─ layouts/
│  │  ├─ BaseLayout.astro    # html lang, <Font>, SEO, hreflang, header/footer, skip-link
│  │  └─ PageLayout.astro    # BaseLayout + PageHero + breadcrumbs + slot
│  ├─ components/
│  │  ├─ seo/Seo.astro  JsonLd.astro  Breadcrumbs.astro
│  │  ├─ layout/ Header.astro  Nav.astro  MobileNav.astro  LangToggle.astro  Footer.astro
│  │  ├─ primitives/ Container.astro  Section.astro  SectionHeading.astro  Eyebrow.astro
│  │  │              Button.astro  Badge.astro  Card.astro  GoldRule.astro  GridTexture.astro
│  │  ├─ cards/ ProductCard.astro  ServiceCard.astro  ProjectCard.astro  ArticleCard.astro  TestimonialCard.astro
│  │  ├─ sections/ Hero.astro  ValueIntro.astro  FocusAreas.astro  ProductsPreview.astro
│  │  │            ServicesPreview.astro  ProjectsPreview.astro  WhyChoose.astro
│  │  │            CredentialStrip.astro  Testimonials.astro  CtaBanner.astro
│  │  ├─ catalog/  CategoryFilter.astro  SpecTable.astro  RfqPanel.astro  EmptyState.astro
│  │  └─ forms/    ContactForm.astro  RfqForm.astro
│  ├─ styles/global.css   # @import "tailwindcss" + @theme
│  ├─ data/categories.ts  # product/service category metadata (label + icon + order)
│  └─ pages/
│     ├─ index.astro  products/index.astro  products/[ref].astro
│     ├─ services/index.astro  services/[slug].astro
│     ├─ projects.astro  about.astro  clients.astro
│     ├─ articles/index.astro  articles/[slug].astro
│     ├─ contact.astro  404.astro
│     └─ en/ (same 11 routes, thin wrappers passing lang="en")
└─ .hermes/plans/  (this file)
```

---

## 5. Key File Contents

### 5.1 `astro.config.mjs`

```js
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // BASE-AGNOSTIC: `site` + `base` are the only two values that change per host.
  // Vercel  → site: 'https://jtech.vercel.app',  base: '/'            (default)
  // GH Pages→ site: 'https://<user>.github.io',  base: '/jtech-company-profile'
  // Both are read from env so no source edit is needed between hosts.
  site: process.env.SITE_URL ?? 'https://jtechlawangperkasa.com',
  base: process.env.BASE_PATH ?? '/',

  output: 'static',          // SSG only — no adapter, ever
  trailingSlash: 'always',   // deterministic URLs on both hosts
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    routing: { prefixDefaultLocale: false },
  },

  image: { responsiveStyles: true },   // sharp is Astro's built-in default service

  fonts: [
    { provider: fontProviders.google(), name: 'Plus Jakarta Sans',
      cssVariable: '--font-body', weights: [400, 500, 600, 700, 800], subsets: ['latin'], display: 'swap' },
    { provider: fontProviders.google(), name: 'Outfit',
      cssVariable: '--font-display', weights: [500, 600, 700], subsets: ['latin'], display: 'swap' },
  ],

  integrations: [sitemap({ i18n: { defaultLocale: 'id', locales: { id: 'id-ID', en: 'en-US' } } })],
  vite: { plugins: [tailwindcss()] },
});
```

### 5.2 `src/lib/url.ts` — the base-agnostic core (single source of truth for every link)

```ts
/** Prefix any site-absolute path with Astro's configured base. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;           // always ends with '/'
  const clean = path.replace(/^\/+/, '');
  return `${base}${clean}`.replace(/\/{2,}/g, '/');
}

export function localePath(lang: 'id' | 'en', path = '/'): string {
  return withBase(lang === 'id' ? path : `/en${path.startsWith('/') ? path : `/${path}`}`);
}
```

**Audit rule (build gate):** `dist/**/*.html` must contain **no** `href="/` or `src="/` that is not base-prefixed. Verified in Task 16.

### 5.3 `src/i18n/utils.ts`

```ts
import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return (key: keyof typeof ui[typeof defaultLang]) =>
    ui[lang][key] ?? ui[defaultLang][key];
}

/** Toggle: strip or add the /en prefix, preserving the rest of the path + base. */
export function switchLangUrl(url: URL, target: Lang): string {
  const base = import.meta.env.BASE_URL;
  let p = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  p = p.replace(/^en\//, '');
  return withBase(target === 'en' ? `/en/${p}`.replace(/\/{2,}/g, '/') : `/${p}`);
}
```

### 5.4 `src/layouts/BaseLayout.astro` (contract)

Responsibilities, in order:
1. `lang={lang}` on `<html>`; `<Font cssVariable="--font-body" preload />` + `<Font cssVariable="--font-display" />` from `astro:assets`.
2. SEO block via `Seo.astro`: title template `%s | PT JTech Lawang Perkasa`, description, canonical (built from `Astro.site` + `withBase`), OG/Twitter cards, `hreflang` alternates for `id`/`en`/`x-default`, theme-color `#0B0F12`.
3. `<JsonLd>` Organization (name, address Metro Parung Panjang, `telephone +628****9323`, email, `foundingDate 2025-06-18`, `identifier` KBLI list, `areaServed ID`).
4. Skip-to-content link, `Header` (sticky, transparent-over-hero → solid on scroll, ~12 lines of inline JS), main slot, `Footer`.
5. `<slot name="head" />` escape hatch.

### 5.5 Forms — no backend, no dependency

`RfqForm.astro` and `ContactForm.astro` post to **no server** (SSG). Behaviour:
- Fields: Nama, Perusahaan, Email, Telepon/WA, Jenis Kebutuhan (produk/jasa/proyek), Detail kebutuhan, Produk terkait (prefilled from product page via query param), Lampiran note.
- Submit → builds a `mailto:` (and/or WhatsApp `wa.me/628788479323` deep link with prefilled body) and hands off to the user's client. Progressive enhancement: the form works with JS disabled as a plain `mailto:` form (`action="mailto:..."` + `method="post"`), JS upgrades it to a nicer prefilled deep-link with client-side validation.
- No third-party form service is added (keeps the dependency budget at 5 and avoids an external account).
- **Open question R6:** if the client wants real server-side submission, that needs either Formspree/Web3Forms (external service) or a serverless function — explicitly out of scope, flagged for the client.

---

## 6. Tasks

### Phase 0 — Prototype & sign-off

**Task 1 — ✅ DONE: HTML+Tailwind prototype + design sign-off**
- Deliverable: `resources/prototype/index.html` + `resources/prototype/assets/img/`.
- No build step: Tailwind 4 via `@tailwindcss/browser@4` CDN + `@theme` tokens in a `type="text/tailwindcss"` block.
- Open directly in a browser: `open resources/prototype/index.html`.
- Covers all 9 home sections + a Design System appendix (palette, type scale, buttons, cards, decision table).
- **Verified in a real browser (not assumed):** Tailwind utilities compile, 0 WCAG contrast violations at 1440/1280/1024/768/375px, no horizontal overflow at 375px, mobile menu hides when closed, all menu tap targets 44px, product filter works (8→4→8 cards), 16/16 images load.
- **Sign-off gate:** Rizki approves the look here. The palette/type/section decisions below are frozen only after this gate.
- ⚠️ Prototype-specific caveat: the CDN scans the DOM and generates only the utilities it finds. The Astro build (Tailwind Vite plugin) generates them at build time — so the *final* site must still be visually re-checked at Task 16.

### Phase 1 — Scaffold & design system

**Task 2 — Repo hygiene & asset intake**
- Files: `.gitignore` ✅ (already created), `.editorconfig`, `README.md` (stub), `resources/` untouched.
- Steps: write `.editorconfig`; copy (not move) `resources/images/*.jpeg` → `src/assets/raw/` for the pipeline.
- **Validate:** `git status --short` shows the expected new files; `resources/` still intact; **no commit yet** (approval-gated).

**Task 3 — ✅ DONE: Astro 7 + Tailwind 4 + Fonts init**
- `package.json` (5 deps + sharp), `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `pnpm-workspace.yaml`.
- **Verified:** `pnpm build` exits 0 · 3 pages built · Astro 7.3.3 · fonts self-hosted (3 woff2 in `dist/_astro/fonts/`) · CSS 40KB · `sitemap-index.xml` generated.
- Pitfalls hit and solved (recorded here because they will recur):
  - **pnpm 11 moved the build-script allowlist** out of `package.json` into `pnpm-workspace.yaml` as `allowBuilds:` (a `pnpm.onlyBuiltDependencies` field is ignored with a warning). Without it, esbuild never builds and Astro cannot run.
  - **sharp must be an explicit dependency** under pnpm (Astro's image service needs it hoisted); otherwise every `<Image>` warns `MissingSharp` and the build fails.
  - **glob loader slug collision:** `foo.id.md` + `foo.en.md` both slugify to `foo`. Fixed with `generateId` that keeps the locale suffix.

**Task 3b — ✅ DONE: Component port from prototype**
- Primitives (`Container`, `Eyebrow`, `SectionHeading`, `Button`, `Logo`, `Icon`), layout (`Header`, `Footer`, `LangToggle`, `WhatsAppFab`), `BaseLayout`, `Seo`, `src/scripts/main.ts`, 10 home sections, `ProductCard`, i18n (`ui.ts`/`utils.ts`/`routes.ts`), `lib/site.ts`/`url.ts`/`format.ts`.
- Content collections + seed data: 8 products (×2 locales), 6 services (×2), 6 projects (×2), 6 articles (×2), 5 testimonials (×2).
- **Verified in a browser against the built output:** fonts self-hosted and rendering (Outfit/Plus Jakarta) · design tokens compile · 0 WCAG contrast violations at 375/768/1440 · no horizontal overflow · marquee AUTO ≥1024px and MANUAL below with dots · marquee actually animates (transform measured moving) · hover-pauses · product filter 8→4→8 · WhatsApp FAB toggles · EN route renders with `lang="en-US"` and the toggle round-trips `/en/` ⇄ `/` · 0 broken images · 16/16 load.
- **Two gates added and passing under BOTH bases** (`/` and `/jtech-company-profile/`): `scripts/audit-links.mjs` (base-prefix + target existence) and `scripts/check-no-client-names.mjs` (client names / SPBU unit codes absent).

**Task 4 — Primitives, header, footer (port from prototype)**
- Files: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`.
- Steps: `pnpm add astro@^7.3.3 @astrojs/sitemap@^3.7.4 tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3` and `pnpm add -D typescript@^5.9.3`; write config per §5.1; `tsconfig.json` extends `astro/tsconfigs/strict`; `global.css` = `@import "tailwindcss";` + the full `@theme` block from §1.3 **plus the `.btn/.card/.nav-dd/.link-gold/.seam/.eyebrow` component rules proven in the prototype**.
- **Validate:** `pnpm astro build` exits 0; `dist/index.html` exists; `pnpm astro info` shows Astro 7.3.x, Vite 8, Tailwind plugin loaded.

**Task 4 — Primitives, header, footer (port from prototype)**
- Files: `src/components/primitives/*` (Container, Section, SectionHeading, Eyebrow, Button, Badge, Card, GoldRule, GridTexture), `src/components/layout/{Header,Nav,MobileNav,LangToggle,Footer}.astro`, `src/layouts/BaseLayout.astro`, `src/i18n/ui.ts`, `src/i18n/utils.ts`, `src/lib/{site,url}.ts`, temporary `src/pages/index.astro`.
- ✅ Absorbed into Task 3b above.

**Task 4 — (superseded)**

### Phase 2 — ✅ DONE: Content pages (all routes live)

**57 pages built.** Every route in the site map now exists in both locales.

| Delivered | Detail |
|---|---|
| Products | index (grid + working category filter) + `[ref]` detail (spec table, application, brand/code, RFQ panel, related) |
| Services | index + `[slug]` detail (scope, deliverables, RFQ, other services) |
| Projects | index (SPBU vs other split, real photo gallery, generic client labels) |
| About | profile prose, vision, 5-point mission, 4 focus pillars, legal table, KBLI register |
| Clients | segment grid, 5 testimonials, credential + KBLI strip |
| Articles | index (category filter, all 9 categories seeded) + `[slug]` detail with rendered Markdown and a cited `sources[]` section |
| Contact | NAP block, legal summary, full RFQ form |
| 404 | bilingual, links only to routes that exist |
| SEO | Organization JSON-LD site-wide + Product/Article JSON-LD, canonical, hreflang, OG/Twitter |

**Verified in a browser across all 19 sampled routes:** every route HTTP 200 · exactly one `<h1>` per page · **0 WCAG contrast violations across all 19 pages** · no horizontal overflow at 375/768/1440 · article filter works (6→1→6) · product filter works (8→4→8) · JSON-LD parses and types are correct · sources render with working hrefs on the safety article.

**Four real bugs found and fixed during this phase** (each caught by a gate, not by eye):
1. **Hardcoded `href="/"`** in PageHero and 404 — broke 21 links under the GH Pages base. Only the second-base build exposed it.
2. **`entry.render()` does not exist** in Astro 7 — the API is `import { render } from 'astro:content'`. All article pages failed until fixed.
3. **Language toggle emitted `/en/404/`** (a 404) from the 404 page. `switchLangUrl` now takes an `exists` predicate built from `import.meta.glob` and falls back to the locale home.
4. **`lang` prop never passed** to PageHero from its 8 callers, and products index declared `lang` as a prop instead of setting it — both caused `undefined` lookups.

Also: seeded real article bodies in both locales (they had been frontmatter-only), and added `.prose-jtech` article typography hand-written rather than pulling in `@tailwindcss/typography` — one fewer dependency.

### Phase 3 — Content layer & SEO

**Task 5 — ✅ i18n core** — `i18n/ui.ts` (every string, both locales), `utils.ts` (§5.3), `routes.ts` (route map + `localize()`), `pair.ts`. **Validate:** unit-free check via a scratch page rendering `useTranslations('id'|'en')` and `switchLangUrl` for all 11 routes; assert `/products/` ⇄ `/en/products/`.

**Task 6 — ✅ Content collections + seeds** — `src/content.config.ts` (§3), then seed entries listed in §3, `_internal/spbu-project-log.md`. **Validate:** `pnpm astro build` exits 0 → schema validated every entry; `getCollection` queries in a scratch page return the expected counts (8/6/6/4/3 per locale).

**Task 7 — ✅ SEO layer** — `Seo.astro`, `JsonLd.astro`, `Breadcrumbs.astro`, `lib/schema.ts`, `robots.txt`, `404.astro`. **Validate:** build → `dist/sitemap-index.xml` + `sitemap-0.xml` present with `xhtml:link hreflang` for every page; paste one product page's JSON-LD into Google's Rich Results Test (or `node -e` JSON parse + schema key assertions); `hreflang` alternates present on every indexable page.

### Phase 3 — Pages (ID, then EN wrappers)

**Task 8 — ✅ Home (ID)** — `src/pages/index.astro` + the 10 section components from §1.6. **Validate:** all 9 sections render at 375 / 768 / 1440px; Lighthouse mobile ≥90 perf/SEO/a11y on the built output.

**Task 9 — ✅ Product catalog + detail** — `products/index.astro` (grid + `CategoryFilter.astro`, filter = inline JS toggling `hidden`, no lib), `products/[ref].astro` (spec table, application, brand/model/code when present, `EmptyState` when `specs` empty, `RfqPanel` prefilled), `ProductCard`, `SpecTable`, `RfqPanel`, `EmptyState`. **Validate:** `getStaticPaths` generates one page per product **per locale**; the RFQ link carries the product ref; a product with no `image` renders the placeholder tile, not a broken image.

**Task 10 — ✅ Services** — `services/index.astro`, `services/[slug].astro` (description, `scope[]`, deliverables, gallery, RFQ CTA). **Validate:** 6 slugs × 2 locales; each page has exactly one `<h1>`.

**Task 11 — ✅ Projects** — `projects.astro` (photo grid from `images[]`, sector/type tags, `clientLabel` only). **Validate:** grep the built HTML for any of the 31 SPBU codes and for `Citra Buana` → **must return zero matches**.

**Task 12 — ✅ About + Clients & Credentials** — `about.astro` (profile, positioning, vision, mission, 4 focus areas, credentials table PT/PMDN/Usaha Mikro/18 Juni 2025, address/phone/email, KBLI register), `clients.astro` (generic industry labels + testimonials + credential trust strip). **Validate:** address/phone/email/KBLI match `resources/REQUIREMENT.md` exactly (diff-checked); no client names rendered.

**Task 13 — ✅ Articles (education)** — `articles/index.astro` (category filter, all 9 education topics present as categories), `articles/[slug].astro` (rendered markdown, `sources[]` rendered as a cited reference list with links + `publishedAt`, no legal/regulatory claims without a source — enforced by making `sources[]` required in the seed entries for the safety/regulatory categories). **Validate:** every article in categories `spbu-safety-compliance` and `industry-regulatory-update` has ≥1 source, else build script fails (small check in `scripts/`).

**Task 14 — ✅ Contact + RFQ** — `contact.astro`, `ContactForm.astro`, `RfqForm.astro` per §5.5. **Validate:** form works with JS disabled (plain `mailto:` submit) and with JS enabled (prefilled WhatsApp/mail deep link); no console errors; phone/email visible as text (not only inside the form).

**Task 15 — ✅ EN mirror** — `src/pages/en/**` (11 routes) as thin wrappers: `const lang='en'` + shared components; EN content entries already seeded in Task 6. **Validate:** every ID route has an EN counterpart; `switchLangUrl` round-trips; `hreflang` pairs resolve to 200 in the built output (script walks `dist/`).

### Phase 4 — Assets, polish, verification

**Task 16 — ✅ DONE: Asset pipeline & performance**

Measured outcomes (was → now):
| Metric | Before | After |
|---|---|---|
| `dist/` size | 9.9 MB | **6.0 MB** |
| Unused source JPEGs shipped | 41 files / 5.0 MB | **0** |
| Unused logo PNG variants | 1 file / 586 kB | **0** |
| `.DS_Store` in published output | 5 | **0** (now a build gate) |
| Social share image | missing | **1200×630, 70 kB** |
| Favicon | missing (404s) | **.ico + 6 PNG sizes + webmanifest** |

- `scripts/prune-assets.mjs` — finds source images no page references and moves them to `resources/unused-images/` (never deletes). Dry-run by default.
- `scripts/make-og.mjs` — builds `public/og/og-default.jpg` from a real project photo + brand scrim.
- `scripts/make-icons.mjs` — favicons + `site.webmanifest` from the logo, including a hand-built ICO container (`sharp` cannot emit `.ico`).
- Dropped `{ eager: true }` from the two `import.meta.glob` call sites and made the logo's light variant a dynamic import — static/eager imports dragged every matched asset into the build graph.
- New build gate: OS marker files (`.DS_Store`, `Thumbs.db`) fail `scripts/audit-links.mjs`. macOS recreates these constantly and Astro copies everything under `src/`.
- `pnpm verify` runs build + both gates.

**Task 17 — ✅ DONE: Lighthouse gate (real runs, not estimates)**

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 98 | **100** | 100 | 100 |
| `/en/` | 98 | **100** | 100 | 100 |
| `/products/` | 99 | **100** | 100 | 100 |
| `/articles/dispenser-components/` | **100** | **100** | 100 | 100 |
| `/contact/` | 99 | **100** | 100 | 100 |

LCP 1.7–2.3 s · TBT 0 ms · CLS 0. Exceeds the plan's ≥90 target on every page.

Fixed from the Lighthouse findings:
1. **`aria-hidden="true"` on the marquee dots container** while JS injects real `<button>`s into it — focusable controls inside an aria-hidden subtree are unreachable. Replaced with `role="group"` + label.
2. **Language toggle failed WCAG 2.5.3 (label in name)** — the two language codes are separate `<span>`s so axe could not match a contiguous accessible name. Now the label is exposed via visually-hidden text, producing a matching name without overriding it.
3. **No favicon** — browsers request `/favicon.ico` implicitly; it 404'd and failed the console-error audit.
4. **Heading order on `/products/`** — cards were `h3` directly under the hero `h1` with no `h2`. `ProductCard` now takes a `headingLevel` prop so the outline is valid on both the home page (h1→h2→h3) and the catalog (h1→h2).

**Task 16 — Asset pipeline**
- Files: `scripts/prepare-assets.mjs`, `scripts/key-logo.mjs`, `src/assets/images/*`.
- Steps: (a) **rename** the 47 `WhatsApp Image 2026-…jpeg` photos to semantic names by inspecting them (`totem-renovation-spbu-01.jpg`, `totem-pole-replacement-04.jpg`, `signage-price-board-02.jpg`, …) and record a mapping table in the plan's appendix for Rizki to correct; (b) **key the logo** white→alpha → `public/logo/jtech-logo.png` + a `-dark.png` knockout variant (the logo currently cannot go on a dark background — this unblocks §1.6 sections 1/5/8/9); (c) build a 1200×630 OG image from a hero photo + gold rule; (d) all photography consumed through `<Image>`/`<Picture>` with explicit `widths`/`sizes` → webp + responsive `srcset`.
- **Validate:** `pnpm build` exit 0; no `<img>` without `width`/`height` in `dist/`; total transferred image weight on the home page < 900 KB; logo renders cleanly on `ink-950`.
- ⚠️ **Client action:** request the **original vector logo (SVG/AI/EPS)** and the raw project photo set — the current JPEG logo is a resize/blur risk and the transparent version is a workaround.

**Task 17 (superseded)** — retained for reference; the table above is the result.
1. `pnpm build` exits 0.
2. `node scripts/audit-links.mjs` — every internal `href`/`src` in `dist/**/*.html` starts with `BASE_URL` and resolves to a file in `dist/`.
3. **Base-agnostic proof:** `BASE_PATH=/jtech-company-profile pnpm build` → re-run the audit → still 100% pass, and `deploy.yml` for GH Pages uses those env values.
4. No published occurrence of the 31 SPBU codes / `Citra Buana` (greps `dist/`).
5. Every page has exactly one `<h1>`, a `<title>`, a meta description, and `hreflang` alternates.
6. Lighthouse mobile (built output) ≥ 90 Performance / 100 Accessibility / 100 SEO on `/`, `/products/`, `/products/<ref>/`, `/contact/`.
7. Responsive check at 375 / 768 / 1024 / 1440 on all 11 routes; 375px has no horizontal scrollbar.
8. Keyboard-only pass: skip link, nav, mobile menu, language toggle, filter chips, form fields, RFQ links.
9. `reduced-motion` respected (all transitions wrapped or disabled).

### Phase 5 — Deploy

**Task 18 — Hosting** — `.github/workflows/deploy.yml` (the official Astro action: `actions/checkout@v7`, `withastro/action@v6`, `actions/deploy-pages@v5`, env `SITE_URL`/`BASE_PATH`, `pnpm-lock.yaml` committed), `vercel.json` (static build, `pnpm build`, output `dist`), `README.md` with both deploy recipes in ID + EN, `public/robots.txt` sitemap pointer. **Validate:** GH Actions workflow dry-run locally via `pnpm build` with GH env values; push is **approval-gated** — no remote, no push until Rizki says so.

---

## 7. Validation Summary

No unit-test suite: this is a static marketing site with no runtime logic — tests would be ceremony. Verification is **real build + real audit scripts + Lighthouse + visual/a11y checks** (Tasks 3, 6, 17). The checks that actually catch regressions here are the link/base audit, the schema-validated build, and the no-client-names grep — all three are scripted so they can be re-run on every change.

## 8. Risks & Open Questions

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | **Logo is a white-background JPEG** — cannot be placed on the dark hero/sections | blocks 4 of 9 home sections as designed | `key-logo.mjs` generates a transparent + knockout variant as an interim; request the original vector from the client (Task 16) |
| R2 | **No product photos/spec data yet** | catalog looks empty at launch | schema is complete now; placeholder tiles + `EmptyState`; content is a copy task, not a code task |
| R3 | Astro 7 is new; small ecosystem drift in docs/plugins | build breakage | deps pinned; only 2 integrations → tiny surface; all APIs used (`glob`, `defineCollection`, `astro:i18n`, `astro:assets` Font/Image) verified against the live Astro docs during recon |
| R4 | **Testimonials are dark-mode WhatsApp screenshots** (`739×1600`) | they look like screenshots dumped on a page | primary = transcribed quotes with generic attribution; screenshots optional inside a phone-frame card on the dark section. If screenshots are used, they must be **redacted** before publishing (check for personal names/numbers) — flagged to client |
| R5 | `trailingSlash: 'always'` differs from some host defaults | 404s / duplicate URLs | enforced in config + link audit; GH Pages and Vercel both honour directory-format output |
| R6 | RFQ form has no backend (SSG) | submissions depend on the user's mail client | mailto:/wa.me handoff with progressive enhancement; server-side submission requires a third-party service or serverless function → **client decision**, out of scope |
| R7 | Image weight: 47 photos, some 1599×1600 @ ~150 KB | slow LCP on mobile | all images through `<Image>` with responsive widths; hero preloaded; budget < 900 KB/home page (Task 17.6) |
| R8 | Duplicate reference-site feel | brief says "structure like alldataint, different design" | §1.5 differentiation table is the acceptance criteria for "different"; Task 1 prototype sign-off is where this is judged |
| R9 | Indonesian regulatory content could imply compliance claims | legal exposure for the client | `sources[]` mandatory for safety/regulatory article categories, rendered with source + date; no "pasti memenuhi standar" language (enforced in the seed copy and the article template) |

**Open questions for Rizki (non-blocking, recommended defaults in bold):**
1. **Slugs are English in both locales** (`/products/`, `/en/products/`) to keep `hreflang` correct and the toggle simple — or do you want Indonesian slugs for the ID locale (`/produk/`)? Default: **English slugs.**
2. **Light or dark footer?** Default: **dark `ink-950`** (matches the hybrid theme).
3. **Hero image** — which project photo should be the hero? Default: the brightest wide shot with a clean totem (I'll pick and you can swap).
4. **Domain** — is `jtechlawangperkasa.com` correct for `site`? (GH Pages/Vercel URLs can override via env.)
5. **Contact channel priority** — email first or WhatsApp first? Default: **WhatsApp primary** (087884479323), email secondary.
6. **Gustafta/analytics** — reference site runs GTM + Hotjar. Default: **none** (no tracking/tracking-consent burden). Add later if wanted.

---

## 9. What Phase 1 (this plan) does NOT do
- No page implementation, no content writing beyond schema-proving seeds, no deploy, no push, no commit.
- `resources/` stays untouched as the source of truth.

## 10. Phase 2 handoff
On approval, generate `.planning/JTECH-WEBSITE/AGENT_INSTRUCTIONS.md` (or `.hermes/plans/…-agent-instructions.md`): exact find/replace blocks per file, ordered by file, with imports, ending in the Task 16 verification commands. Task order is already dependency-correct (0 → 1 → 2 → 3 sign-off → pages → assets → verify → deploy), so sub-agents can be dispatched per task with a disjoint write set.

---

## Amendment 1 — Theme switched to light-only

**Date:** owner review (design sign-off round).
**Decision (owner):** "The owner don't like black background" / "more lighten not dark…
just use one mode." → **one mode, light. No dark sections, no dark-mode toggle.**

**What changed in the prototype** (`resources/prototype/index.html`):

| Was | Now |
|---|---|
| `bg-ink-950` / `ink-900` section bands (header, hero, services, testimonials, contact, footer) | `bg-white` / `bone-50` / `bone-100` / `navy-50` — all light |
| `ink` (near-black) scale | `navy` scale; `#102642` is the primary text/heading colour, never a background |
| Text roles for dark surfaces: `navy-200`, `navy-300`, `gold-500`, `text-white`, `border-white/*` | Light-surface roles: `navy-600`, `navy-500`, `gold-800`, `navy-900`, `border-navy-200` |
| `logo-dark.png` (white wordmark) in header | `logo-light.png` (dark ink) — verified by sampling ink pixels |
| `.card-dark` (navy-800 cards), white grid texture, `--mq-fade: navy-950` | White cards w/ navy hairline, navy grid texture, `--mq-fade: #fff` |

**Evidence (measured, not asserted):**
- Full-page pixel scan, 1440×11014: every 500px background band luminance **0.888–0.991** → **0 dark bands**.
- All 9 `section[id]` computed backgrounds light (min luminance 0.89).
- Footer `rgb(255,255,255)`; links 6.51:1; gold headings 6.62:1.
- Contrast violations **82 → 0 real** (the 2 remaining audit flags are a caption over its own dark scrim; real pixels there measure 15.58:1 white / 10.67:1 gold — the auditor cannot read CSS gradients).
- Horizontal overflow 0 at 375 / 768 / 1440 after converting X-axis reveals to `translateY` under 640px.
- 0 small tap targets; 16/16 images load; 0 client-name or SPBU-code leaks; exactly 1 `<h1>`.

**Phase-2 note:** `src/styles/global.css` still carries the old `ink-*` dark tokens and
`dark`-oriented button helpers (`btn-on-dark`, `btn-outline-light`). Porting the light
palette into the Astro source is the next step; the prototype is the source of truth.
