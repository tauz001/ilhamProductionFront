import {getMetafieldValue} from './shopify-fields';

export const DEFAULT_SAME_DAY_DELIVERY_FEE_INR = 30;

export type ProductAudience = 'women' | 'men' | 'unisex';

export type SizeChartRow = {
  size: string;
  bust?: number;
  chest?: number;
  waist: number;
  hip?: number;
  shoulder?: number;
};

export type SizeRecommendationInput = {
  audience: ProductAudience;
  chart?: SizeChartRow[];
  bust?: number;
  chest?: number;
  waist?: number;
  hip?: number;
};

const WOMEN_SIZE_CHART: SizeChartRow[] = [
  {size: 'XS', bust: 32, waist: 26, hip: 36},
  {size: 'S', bust: 34, waist: 28, hip: 38},
  {size: 'M', bust: 36, waist: 30, hip: 40},
  {size: 'L', bust: 38, waist: 32, hip: 42},
  {size: 'XL', bust: 40, waist: 34, hip: 44},
  {size: 'XXL', bust: 42, waist: 36, hip: 46},
];

const MEN_SIZE_CHART: SizeChartRow[] = [
  {size: 'S', chest: 38, waist: 32, shoulder: 17},
  {size: 'M', chest: 40, waist: 34, shoulder: 17.5},
  {size: 'L', chest: 42, waist: 36, shoulder: 18},
  {size: 'XL', chest: 44, waist: 38, shoulder: 18.5},
  {size: 'XXL', chest: 46, waist: 40, shoulder: 19},
];

export function getProductAudience(product: any): ProductAudience {
  const configuredAudience = getMetafieldValue(product, 'audience')
    ?.trim()
    .toLowerCase();
  if (
    configuredAudience === 'women' ||
    configuredAudience === 'men' ||
    configuredAudience === 'unisex'
  ) {
    return configuredAudience;
  }

  const text = [
    product?.title,
    product?.handle,
    product?.vendor,
    product?.productType,
    ...(product?.tags ?? []),
    getMetafieldValue(product, 'subtitle'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const hasWomenSignal = /\bwomen'?s?\b|\bkurti\b|\bkurtis\b|\banarkali\b|\bsaree\b|\blehenga\b/.test(
    text,
  );
  const hasMenSignal = /\bmen'?s?\b|\bpathani\b|\bnawabi\b|\bkurta pajama\b|\bsherwani\b/.test(
    text,
  );

  if (hasMenSignal && !hasWomenSignal) return 'men';
  if (hasWomenSignal && !hasMenSignal) return 'women';
  return 'unisex';
}

export function getSizeChartForProduct(product: any) {
  return (
    parseConfiguredSizeChart(getMetafieldValue(product, 'size_chart')) ??
    (getProductAudience(product) === 'men' ? MEN_SIZE_CHART : WOMEN_SIZE_CHART)
  );
}

export function recommendProductSize({
  audience,
  chart: configuredChart,
  bust,
  chest,
  waist,
  hip,
}: SizeRecommendationInput) {
  const chart =
    configuredChart ?? (audience === 'men' ? MEN_SIZE_CHART : WOMEN_SIZE_CHART);

  if (audience === 'men' ? !chest || !waist : !bust || !waist || !hip) {
    return null;
  }

  return chart.find((row) => {
      const upperBodyFits =
        audience === 'men'
          ? !chest || !row.chest || chest <= row.chest
          : !bust || !row.bust || bust <= row.bust;

      return (
        upperBodyFits &&
        (!waist || waist <= row.waist) &&
        (!hip || !row.hip || hip <= row.hip)
      );
    }) ?? null;
}

export function getProductFitNote(product: any) {
  return getMetafieldValue(product, 'fit_note')?.trim() ?? '';
}

function parseConfiguredSizeChart(value?: string | null) {
  if (!value?.trim()) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'rows' in parsed
        ? (parsed as {rows?: unknown}).rows
        : null;

    if (!Array.isArray(rows)) return null;

    const normalizedRows = rows
      .map(normalizeSizeChartRow)
      .filter((row): row is SizeChartRow => Boolean(row));

    return normalizedRows.length ? normalizedRows : null;
  } catch {
    console.warn(
      'Invalid Shopify field: product metafield custom.size_chart must be JSON.',
    );
    return null;
  }
}

function normalizeSizeChartRow(value: unknown): SizeChartRow | null {
  if (!value || typeof value !== 'object') return null;

  const row = value as Record<string, unknown>;
  const size = String(row.size ?? '').trim();
  const waist = positiveNumber(row.waist);
  if (!size || waist === undefined) return null;

  return {
    size,
    waist,
    bust: positiveNumber(row.bust),
    chest: positiveNumber(row.chest),
    hip: positiveNumber(row.hip),
    shoulder: positiveNumber(row.shoulder),
  };
}

function positiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function getWashCareForFabric(
  fabric?: string | null,
  explicitCare?: string | null,
) {
  if (explicitCare?.trim()) return explicitCare.trim();

  const normalized = fabric?.toLowerCase() ?? '';

  if (/(chiffon|georgette|organza|silk|tissue|net)/.test(normalized)) {
    return 'Dry clean recommended. Steam on low from the reverse side, never wring, and store folded in breathable cloth.';
  }

  if (/(cotton|mulmul|voile|cambric|lawn)/.test(normalized)) {
    return 'Cold gentle hand wash separately with mild detergent. Dry in shade, iron inside out on low heat, and avoid soaking embroidery.';
  }

  if (/(linen|flax)/.test(normalized)) {
    return 'Cold gentle wash or dry clean. Reshape while damp, dry in shade, and iron inside out while slightly moist.';
  }

  if (/(rayon|viscose|modal)/.test(normalized)) {
    return 'Dry clean preferred. If washing, use cold water, mild detergent, no wringing, and dry flat in shade.';
  }

  if (/(wool|pashmina|cashmere)/.test(normalized)) {
    return 'Dry clean only. Air between wears and store folded with tissue in a breathable cover.';
  }

  return 'Dry clean recommended for hand-embroidered chikankari. Store folded in breathable cloth and keep away from direct sunlight.';
}

export function isSameDayDeliveryPincode(
  pincode: string,
  configuredPrefixes = '226',
) {
  const normalizedPincode = pincode.trim();
  if (!/^\d{6}$/.test(normalizedPincode)) return false;

  const prefixes = configuredPrefixes
    .split(',')
    .map((prefix) => prefix.replace(/\D/g, '').trim())
    .filter(Boolean);

  return prefixes.some((prefix) => normalizedPincode.startsWith(prefix));
}
