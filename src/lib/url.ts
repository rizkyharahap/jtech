/**
 * Base-agnostic URL helpers.
 *
 * GitHub Pages serves project sites under /<repo>/ while Vercel serves at /.
 * Astro exposes the configured base as import.meta.env.BASE_URL (always with a
 * trailing slash). Every internal link in the site must go through these
 * helpers so a single BASE_PATH env var switches hosts with no code change.
 */

/** Prefix a site-absolute path with the configured base. */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\/+/, '');
  return `${base}${clean}`.replace(/\/{2,}/g, '/');
}

export type Lang = 'id' | 'en';

/** Build a link to `path` in the given locale (default locale lives at root). */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return withBase(lang === 'id' ? clean : `/en${clean}`);
}

/** Absolute URL for canonical/OG tags. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const rel = withBase(path);
  return site ? new URL(rel, site).href : rel;
}
