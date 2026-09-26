/** Totem / SPBU renovation photos from the HD image set. */
export const TOTEM_IMAGE_KEYS = [
  'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09',
] as const;

export type TotemImageKey = (typeof TOTEM_IMAGE_KEYS)[number];

export async function resolveTotemImages(
  glob: Record<string, () => Promise<{ default: import('astro').ImageMetadata }>>,
  keys: readonly string[] = TOTEM_IMAGE_KEYS,
) {
  async function imgFor(key: string) {
    const path = Object.keys(glob).find((p) => p.includes(`/${key}.`));
    if (!path) return undefined;
    return (await glob[path]()).default;
  }

  const resolved = await Promise.all(keys.map(async (key) => ({ key, img: await imgFor(key) })));
  return resolved.filter((entry): entry is { key: string; img: import('astro').ImageMetadata } => Boolean(entry.img));
}
