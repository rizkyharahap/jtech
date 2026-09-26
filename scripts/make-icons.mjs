#!/usr/bin/env node
/**
 * Generates favicons + app icons from the brand logo.
 *
 * Source is the transparent gold emblem (logo-dark.png). We render it on the
 * ink background so it reads on both light and dark browser chrome.
 *
 * A real .ico container is written by hand (sharp cannot emit .ico) so the
 * implicit /favicon.ico request never 404s — Lighthouse flagged that.
 *
 * Run:  node scripts/make-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC = 'src/assets/img/logo-dark.png';
const OUT = 'public';
const STEEL = { r: 27, g: 58, b: 92, alpha: 1 }; // #1B3A5C steel-800 — the dark surface in the palette

mkdirSync(OUT, { recursive: true });

/** Render the emblem at exactly `size`×`size` on the ink tile. */
async function tile(size, background = STEEL) {
  // Compute the inset from the target size and derive the inner box by
  // subtraction — rounding the inset independently overflowed (a 32px tile
  // came out 33px because 24.96+4+4 rounds up).
  const inset = Math.floor(size * 0.11);
  const inner = size - inset * 2;
  return sharp(SRC)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({ top: inset, bottom: inset, left: inset, right: inset, background })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Minimal ICO container wrapping PNG data (valid for modern browsers). */
function buildIco(entriesIn) {
  const count = entriesIn.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  // Directory entries (16 bytes each) start immediately after the 6-byte header.
  // Image data begins after the full directory: 6 + count * 16.
  const dataStart = 6 + count * 16;

  const dir = [];
  const blobs = [];
  let offset = dataStart;
  for (const { size, data } of entriesIn) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette count
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    blobs.push(data);
    offset += data.length;
  }
  return Buffer.concat([header, ...dir, ...blobs]);
}

// 1. PNG icons
const pngs = {};
for (const size of [16, 32, 48, 180, 192, 512]) {
  const buf = await tile(size);
  pngs[size] = buf;
  const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`;
  writeFileSync(`${OUT}/${name}`, buf);
  console.log(`  ${name} (${Math.round(buf.length / 1024)} kB)`);
}

// 2. favicon.ico containing 16/32/48
const ico = buildIco([
  { size: 16, data: pngs[16] },
  { size: 32, data: pngs[32] },
  { size: 48, data: pngs[48] },
]);
writeFileSync(`${OUT}/favicon.ico`, ico);
console.log(`  favicon.ico (${Math.round(ico.length / 1024)} kB, 3 sizes)`);

// 3. web app manifest so mobile installs use the icon + theme colour
const manifest = {
  name: 'PT JTech Lawang Perkasa',
  short_name: 'JTech',
  description: 'Business Partner for Products, Services & Project Solutions',
  start_url: '/',
  display: 'standalone',
  background_color: '#FFFFFF',
  theme_color: '#102642',
  icons: [
    { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
writeFileSync(`${OUT}/site.webmanifest`, JSON.stringify(manifest, null, 2) + '\n');
console.log('  site.webmanifest');
