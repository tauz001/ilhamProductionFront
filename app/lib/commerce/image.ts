export const HERO_IMAGE_WIDTHS = [640, 960, 1280, 1600, 2048];
export const MOBILE_HERO_IMAGE_WIDTHS = [480, 720, 960, 1200];
export const CARD_IMAGE_WIDTHS = [320, 480, 640, 800];
export const PDP_IMAGE_WIDTHS = [640, 960, 1280, 1600];

export function shopifyImageUrl(src: string | null | undefined, width: number) {
  if (!src || !isShopifyCdnUrl(src)) return src ?? '';

  const [base, query = ''] = src.split('?');
  const params = new URLSearchParams(query);
  params.set('width', String(width));
  return `${base}?${params.toString()}`;
}

export function shopifySrcSet(
  src: string | null | undefined,
  widths: number[],
) {
  if (!src) return undefined;
  if (!isShopifyCdnUrl(src)) return src;

  return widths
    .map((width) => `${shopifyImageUrl(src, width)} ${width}w`)
    .join(', ');
}

function isShopifyCdnUrl(src: string) {
  return src.includes('cdn.shopify.com');
}
