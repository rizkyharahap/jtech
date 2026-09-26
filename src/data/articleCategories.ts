export const ARTICLE_CATEGORIES = {
  'product-knowledge': { id: 'Product Knowledge', en: 'Product Knowledge' },
  'spbu-equipment-components': { id: 'Equipment & Komponen', en: 'Equipment & Components' },
  'maintenance-facility': { id: 'Maintenance & Fasilitas', en: 'Maintenance & Facility' },
  'spbu-safety-compliance': { id: 'Keselamatan & Kepatuhan', en: 'Safety & Compliance' },
  'product-selection-tips': { id: 'Tips Pemilihan Produk', en: 'Product Selection Tips' },
  'renovation-facility': { id: 'Renovasi & Fasilitas', en: 'Renovation & Facility' },
  'industry-regulatory-update': { id: 'Update Regulasi', en: 'Regulatory Update' },
  'project-insight': { id: 'Project Insight', en: 'Project Insight' },
  'company-product-update': { id: 'Update Perusahaan', en: 'Company & Product Update' },
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
export const ARTICLE_CATEGORY_KEYS = Object.keys(ARTICLE_CATEGORIES) as ArticleCategory[];
