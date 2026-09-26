#!/usr/bin/env node
/**
 * Generates the social sharing image (1200x630) at public/og/og-default.jpg.
 *
 * Composed from a real JTech project photo + the brand gold rule and the
 * company wordmark, using sharp (already a dependency for astro:assets).
 *
 * Run:  node scripts/make-og.mjs
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const W = 1200;
const H = 630;
const OUT_DIR = 'public/og';
const OUT = join(OUT_DIR, 'og-default.jpg');
const PHOTO = 'src/assets/img/p07.jpeg'; // real SPBU totem work
const LOGO = 'src/assets/img/logo-dark.png';

const GOLD = '#DAC967';
const STEEL = '#102642'; // navy-950 — the dark surface the prototype uses

if (!existsSync(PHOTO)) {
  console.error(`✗ missing source photo ${PHOTO}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// 1. Base: the photo, cover-cropped, darkened and de-saturated so the text
//    above it stays legible (contrast, not decoration).
const base = await sharp(PHOTO)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.55, saturation: 0.5 })
  .toBuffer();

// 2. Ink scrim, stronger on the left where the text sits.
const scrim = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.45">
         <stop offset="0%"   stop-color="${STEEL}" stop-opacity="0.96"/>
         <stop offset="55%"  stop-color="${STEEL}" stop-opacity="0.82"/>
         <stop offset="100%" stop-color="${STEEL}" stop-opacity="0.55"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
     <rect x="0" y="0" width="10" height="${H}" fill="${GOLD}"/>
   </svg>`,
);

/**
 * Text is rendered as SVG rather than drawn with a font engine: avoids a
 * canvas/font dependency and keeps this script to dependencies we already have.
 * The typefaces are the same families the site self-hosts (Outfit for display).
 */
const CAUTION = 'ISO-8859-1'; // keep the SVG ASCII-only so sharp renders it
void CAUTION;
const text = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <text x="72" y="150" font-family="Helvetica,Arial,sans-serif" font-size="24"
           font-weight="700" letter-spacing="5" fill="${GOLD}">PT JTECH LAWANG PERKASA</text>

     <text x="72" y="268" font-family="Helvetica,Arial,sans-serif" font-size="66"
           font-weight="700" fill="#FFFFFF">Business Partner for</text>
     <text x="72" y="352" font-family="Helvetica,Arial,sans-serif" font-size="66"
           font-weight="700" fill="${GOLD}">Products, Services</text>
     <text x="72" y="436" font-family="Helvetica,Arial,sans-serif" font-size="66"
           font-weight="700" fill="#FFFFFF">&amp; Project Solutions</text>

     <rect x="72" y="486" width="120" height="4" fill="${GOLD}"/>

     <text x="72" y="548" font-family="Helvetica,Arial,sans-serif" font-size="27"
           fill="#DCE8F4">Supporting SPBU, Energy &amp; Business Operations</text>
     <text x="72" y="588" font-family="Helvetica,Arial,sans-serif" font-size="22"
           fill="#DCE8F4" fill-opacity="0.75">jtechlawangperkasa.com  &#183;  ptjtechlawangperkasa@gmail.com</text>
   </svg>`,
);

// 3. Composite, then place the logo top-right.
const logo = await sharp(LOGO)
  .resize({ height: 104, fit: 'inside' })
  .toBuffer();

await sharp(base)
  .composite([
    { input: scrim, top: 0, left: 0 },
    { input: text, top: 0, left: 0 },
    { input: logo, top: 60, left: W - 300 },
  ])
  .jpeg({ quality: 88, progressive: true, mozjpeg: true })
  .toFile(OUT);

const { size } = await sharp(OUT).metadata().then(async (m) => ({ size: m.size }));
console.log(`✓ ${OUT} (${W}x${H}, ${Math.round((size ?? 0) / 1024)} kB)`);
