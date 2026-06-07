import {getMetafieldValue, parseListField, tagIncludes} from './shopify-fields';

export function getVariantOptionValues(product: any, optionName: string) {
  const normalizedName = optionName.toLowerCase();
  const values = new Set<string>();

  product?.variants?.nodes?.forEach((variant: any) => {
    variant.selectedOptions?.forEach((option: {name: string; value: string}) => {
      if (option.name.toLowerCase() === normalizedName && option.value) {
        values.add(option.value);
      }
    });
  });

  return [...values];
}

export function getProductFabricValue(product: any) {
  return (
    getMetafieldValue(product, 'fabric') ??
    getVariantOptionValues(product, 'fabric')[0] ??
    ''
  );
}

export function getProductColorValue(product: any) {
  return (
    getMetafieldValue(product, 'color') ??
    getVariantOptionValues(product, 'color')[0] ??
    ''
  );
}

export function getProductOccasionValues(product: any) {
  const fromMetafield = parseListField(getMetafieldValue(product, 'occasions'));
  const tags = product?.tags ?? [];
  const tagOccasions = [
    'daily',
    'everyday',
    'party',
    'festive',
    'ethnic',
    'office',
    'wedding',
    'bridal',
    'groom',
    'sangeet',
    'mehfil',
    'gift',
  ].filter((tag) => tagIncludes(tags, tag));

  return [...new Set([...fromMetafield, ...tagOccasions])];
}

export function getProductSizeValues(product: any) {
  return getVariantOptionValues(product, 'size');
}

export function getProductPrice(product: any) {
  return Number.parseFloat(product?.priceRange?.minVariantPrice?.amount ?? '0');
}

export function productMatchesText(product: any, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return getProductSearchText(product).includes(normalized);
}

export function productMatchesAnyText(product: any, needles: string[]) {
  const text = getProductSearchText(product);
  return needles.some((needle) => text.includes(needle.toLowerCase()));
}

export function getProductSearchText(product: any) {
  const parts = [
    product?.title,
    product?.handle,
    product?.vendor,
    product?.productType,
    ...(product?.tags ?? []),
    getMetafieldValue(product, 'subtitle'),
    getProductFabricValue(product),
    getProductColorValue(product),
    ...getProductOccasionValues(product),
    ...getProductSizeValues(product),
  ];

  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function productMatchesMenuCategory(product: any, category: string) {
  const text = getProductSearchText(product);
  const hasWomenWord = /\bwomen'?s?\b/.test(text);
  const hasMenWord = /\bmen'?s?\b/.test(text);
  const hasKurtaWord = /\bkurta\b/.test(text);
  const hasKurtiWord = /\bkurti\b|\bkurtis\b/.test(text);
  const isMenOnly =
    (hasMenWord || /\bpathani\b|\bkurta pajama\b/.test(text)) &&
    !hasWomenWord;

  if (category === 'women') {
    return (
      !isMenOnly &&
      productMatchesAnyText(product, [
        'women',
        'kurti',
        'kurta',
        'anarkali',
        'saree',
        'dupatta',
        'kaftan',
        'co-ord',
        'ethnic',
        'chikankari',
      ])
    );
  }

  if (category === 'men') {
    return (
      hasMenWord ||
      productMatchesAnyText(product, ['pathani', 'nawabi', 'shirt', 'bandi']) ||
      (hasKurtaWord && !hasKurtiWord && !hasWomenWord)
    );
  }

  if (category === 'wedding') {
    return (
      productMatchesAnyText(product, [
        'wedding',
        'bridal',
        'bride',
        'groom',
        'sangeet',
        'mehendi',
        'ceremony',
        'occasion',
        'lehenga',
      ]) || text.includes('festive')
    );
  }

  return false;
}
