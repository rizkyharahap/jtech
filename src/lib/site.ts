/** Site-wide constants. Single source of truth for NAP + legal facts. */

export const SITE = {
  legalName: 'PT JTech Lawang Perkasa',
  marketingName: 'JTech Lawang Perkasa',
  shortName: 'JTech',
  positioning: 'Business Partner for Products, Services & Project Solutions',
  strapline: 'Supporting SPBU, Energy & Business Operations',
  founded: '2025-06-18',
  foundedLabel: { id: '18 Juni 2025', en: '18 June 2025' },
  entityType: 'Perseroan Terbatas (PT)',
  investmentStatus: 'PMDN',
  businessScale: { id: 'Usaha Mikro', en: 'Micro Enterprise' },
  phoneLocal: '087884479323',
  phoneDisplay: '0878 8447 9323',
  phoneIntl: '+6287884479323',
  whatsapp: '6287884479323',
  email: 'ptjtechlawangperkasa@gmail.com',
  address: {
    id: 'Metro Parung Panjang Blok C5 No. 31, Desa Cibunar, Kec. Parung Panjang, Kab. Bogor, Jawa Barat 16360',
    en: 'Metro Parung Panjang Block C5 No. 31, Cibunar Village, Parung Panjang, Bogor Regency, West Java 16360',
  },
  addressShort: { id: 'Parung Panjang, Bogor', en: 'Parung Panjang, Bogor' },
  region: 'ID',
  /** KBLI business classification codes (legal register). */
  kbli: [
    { code: '46610', label: { id: 'Perdagangan Besar Bahan Bakar Padat, Cair dan Gas', en: 'Wholesale of Solid, Liquid and Gas Fuels' } },
    { code: '46900', label: { id: 'Perdagangan Besar Berbagai Macam Barang', en: 'Wholesale Trade of Various Goods' } },
    { code: '41019', label: { id: 'Konstruksi Gedung Lainnya', en: 'Construction of Other Buildings' } },
    { code: '42201', label: { id: 'Konstruksi Jaringan Irigasi dan Drainase', en: 'Construction of Irrigation and Drainage Networks' } },
    { code: '46593', label: { id: 'Perdagangan Besar Alat Transportasi Darat, Suku Cadang dan Perlengkapannya', en: 'Wholesale of Land Transport Equipment, Parts and Accessories' } },
    { code: '46599', label: { id: 'Perdagangan Besar Mesin, Peralatan dan Perlengkapan Lainnya', en: 'Wholesale of Other Machinery, Equipment and Supplies' } },
  ],
} as const;

/** Prefilled WhatsApp deep link. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
