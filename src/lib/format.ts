/** Locale-aware formatting helpers. */

export type Lang = 'id' | 'en';

const locale = (lang: Lang) => (lang === 'id' ? 'id-ID' : 'en-US');

export function formatDate(d: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
