// Delivery uses pre-approved, pre-optimized CDN assets. Rendering never creates
// a Cloudinary transformation (and therefore cannot silently consume transform quota).
export function coverAsset(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      !url.search && !url.hash && url.hostname === 'res.cloudinary.com' &&
      /^\/dljwhlvid\/image\/upload\/v\d+\/saradakosh\/library-covers\/[\w/-]+\.(?:avif|webp)$/u.test(url.pathname) ? value : null;
  } catch { return null; }
}

export function coverDelivery(cover, detail = false) {
  if (!cover) return null;
  let variants;
  try { variants = JSON.parse(cover.variants_json || '[]'); } catch { return null; }
  if (!Array.isArray(variants)) return null;
  const limit = detail ? 150_000 : 45_000;
  const maxWidth = detail ? 720 : 480;
  variants = variants.filter(item => item && coverAsset(item.url) && Number.isInteger(item.width) && item.width > 0 &&
    item.width <= maxWidth && Number.isInteger(item.height) && item.height > 0 &&
    Number.isInteger(item.bytes) && item.bytes > 0 && item.bytes <= limit);
  const sources = ['avif', 'webp'].map(format => ({ format, variants: variants.filter(item => item.format === format)
    .sort((a, b) => a.width - b.width) })).filter(source => source.variants.length);
  if (!sources.length) return null;
  const preferred = sources.find(source => source.format === 'webp') || sources[0];
  const fallback = preferred.variants[0];
  return { sources: sources.map(source => ({ type: `image/${source.format}`,
    srcSet: source.variants.map(item => `${item.url} ${item.width}w`).join(', ') })),
    src: fallback.url, width: fallback.width, height: fallback.height,
    sizes: detail ? '(max-width: 700px) 150px, 240px' : '(max-width: 340px) calc(100vw - 36px), (max-width: 700px) calc((100vw - 52px) / 2), (max-width: 1000px) calc((100vw - 96px) / 3), 284px' };
}
