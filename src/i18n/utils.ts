import { ui, defaultLang, type Lang, type UIKey } from './ui';
import { withBase, type Lang as UrlLang } from '../lib/url';

export type { Lang };

/** Which locale does this URL belong to? (/en/... → 'en', else default) */
export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  return seg === 'en' ? 'en' : defaultLang;
}

/** Translation function for a locale, falling back to the default locale. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Target URL of the language toggle: strip or add the /en prefix while
 * preserving the rest of the path and the configured base.
 *
 * `exists` is a predicate telling us whether the counterpart page is real.
 * The 404 page (and any future single-locale page) has no EN mirror, so the
 * toggle must fall back to that locale's home rather than emit a 404 link.
 */
export function switchLangUrl(
  url: URL,
  target: Lang,
  exists: (path: string) => boolean = () => true,
): string {
  const base = import.meta.env.BASE_URL;
  let p = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  p = p.replace(/^\/+/, '');
  p = p.replace(/^en\/?/, '');

  const same = target === 'en' ? withBase(`/en/${p}`) : withBase(`/${p}`);
  if (exists(same)) return same;

  // No counterpart — send the visitor to that locale's home page.
  return target === 'en' ? withBase('/en/') : withBase('/');
}

/** The other locale (used by the toggle). */
export function otherLang(lang: Lang): Lang {
  return lang === 'id' ? 'en' : 'id';
}

/** html lang attribute value. */
export function htmlLang(lang: Lang): string {
  return lang === 'id' ? 'id-ID' : 'en-US';
}
