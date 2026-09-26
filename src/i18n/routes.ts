import { localePath, type Lang } from '../lib/url';
import { type UIKey } from './ui';

/**
 * Canonical route map. Path segments are IDENTICAL in both locales so that
 * Astro's i18n + sitemap emit correct hreflang pairs, and the language toggle
 * is a pure prefix swap (withBase('/en' + path)).
 */
export const ROUTES = {
  home: '/',
  products: '/products/',
  services: '/services/',
  projects: '/projects/',
  about: '/about/',
  clients: '/clients/',
  articles: '/articles/',
  contact: '/contact/',
} as const;

export type RouteKey = keyof typeof ROUTES;

export const NAV: { key: RouteKey; label: UIKey }[] = [
  { key: 'products', label: 'nav.products' },
  { key: 'services', label: 'nav.services' },
  { key: 'projects', label: 'nav.projects' },
  { key: 'about', label: 'nav.about' },
  { key: 'clients', label: 'nav.clients' },
  { key: 'articles', label: 'nav.articles' },
];

/** Localised href for a named route. */
export function route(lang: Lang, key: RouteKey): string {
  return localePath(lang, ROUTES[key]);
}
