/** JSON-LD builders. Kept in one place so every page emits consistent markup. */
import { SITE } from './site';
import { absoluteUrl } from './url';
import type { Lang } from '../i18n/utils';

export function organization(site: URL | undefined, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.legalName,
    alternateName: SITE.marketingName,
    url: absoluteUrl('/', site),
    email: SITE.email,
    telephone: SITE.phoneIntl,
    foundingDate: SITE.founded,
    slogan: SITE.positioning,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address[lang],
      addressRegion: lang === 'id' ? 'Jawa Barat' : 'West Java',
      postalCode: '16360',
      addressCountry: 'ID',
    },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    identifier: SITE.kbli.map((k) => ({ '@type': 'PropertyValue', propertyID: 'KBLI', value: k.code })),
  };
}

export function breadcrumbs(items: { name: string; url: string }[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url, site),
    })),
  };
}

export function product(p: { name: string; description: string; sku?: string; brand?: string; url: string }, site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    url: absoluteUrl(p.url, site),
    /**
     * Deliberately no `offers` node: JTech quotes per request and publishes no
     * price. Fabricating a price range would be a false claim to Google.
     */
    additionalProperty: [{ '@type': 'PropertyValue', propertyID: 'availability', value: 'Quote on request' }],
  };
}

export function article(a: { title: string; description: string; published: Date; author: string; url: string }, site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.published.toISOString(),
    author: { '@type': 'Organization', name: a.author },
    publisher: { '@type': 'Organization', name: SITE.legalName },
    mainEntityOfPage: absoluteUrl(a.url, site),
  };
}
