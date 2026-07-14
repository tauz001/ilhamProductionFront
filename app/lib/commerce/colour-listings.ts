import {getMetafieldValue} from './shopify-fields';

type SelectedOption = {
  name: string;
  value: string;
};

type ColourListingDetails = {
  colour: string;
  key: string;
  optionName: string;
  selectedOptions: SelectedOption[];
  url: string;
};

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function expandColourVariantListings(products: any[]) {
  return products.flatMap((product) => expandColourVariantProduct(product));
}

export function getProductListingKey(product: any) {
  return (
    getColourListingDetails(product)?.key ??
    product?.id ??
    product?.handle ??
    product?.title
  );
}

export function getProductListingUrl(product: any) {
  return (
    getColourListingDetails(product)?.url ??
    (product?.handle ? `/products/${product.handle}` : '/')
  );
}

export function getProductListingSelectedOptions(product: any) {
  return getColourListingDetails(product)?.selectedOptions ?? [];
}

export function getProductListingColour(product: any) {
  return getColourListingDetails(product)?.colour ?? '';
}

export function isVirtualColourListing(product: any) {
  return Boolean(getColourListingDetails(product));
}

export function getSplitColourProductTitle(product: any, variant: any) {
  if (!shouldSplitColourListings(product)) return product?.title ?? '';

  const colourOption = variant?.selectedOptions?.find((option: SelectedOption) =>
    isColourOptionName(option.name),
  );

  return colourOption?.value
    ? appendColourToTitle(getBaseTitle(product), colourOption.value)
    : product?.title ?? '';
}

function expandColourVariantProduct(product: any) {
  if (!shouldSplitColourListings(product)) return [product];

  const colourOption = product?.options?.find((option: {name?: string}) =>
    isColourOptionName(option?.name),
  );
  const optionValues = colourOption?.optionValues ?? [];

  if (optionValues.length <= 1) return [product];

  const listings = optionValues
    .map((optionValue: any) => {
      const colour = optionValue?.name?.trim();
      const variant =
        optionValue?.firstSelectableVariant ??
        findRepresentativeVariant(product, colourOption.name, colour);

      if (!colour || !variant?.id) return null;

      const selectedOptions = [{name: colourOption.name, value: colour}];
      const listingUrl = buildVariantListingUrl(product.handle, selectedOptions);
      const image = variant.image ?? product.featuredImage ?? null;

      return {
        ...product,
        title: appendColourToTitle(getBaseTitle(product), colour),
        featuredImage: image,
        images: {
          ...(product.images ?? {}),
          nodes: image ? [image] : [],
        },
        selectedOrFirstAvailableVariant: variant,
        priceRange: variant.price
          ? {
              minVariantPrice: variant.price,
              maxVariantPrice: variant.price,
            }
          : product.priceRange,
        __colourListing: {
          colour,
          key: `${product.handle}::${colourOption.name}::${colour}`,
          optionName: colourOption.name,
          selectedOptions,
          url: listingUrl,
        } satisfies ColourListingDetails,
      };
    })
    .filter(Boolean);

  return listings.length ? listings : [product];
}

function shouldSplitColourListings(product: any) {
  if (!isTruthyMetafield(product, 'split_colour_listings')) return false;

  return !(
    getMetafieldValue(product, 'connected_colour_products') ||
    getMetafieldValue(product, 'connected_color_products')
  );
}

function isTruthyMetafield(product: any, key: string) {
  const value = getMetafieldValue(product, key)?.trim().toLowerCase();
  return value ? TRUE_VALUES.has(value) : false;
}

function findRepresentativeVariant(
  product: any,
  optionName: string,
  optionValue: string,
) {
  const variants = product?.variants?.nodes ?? [];
  return variants.find((variant: any) =>
    variant?.selectedOptions?.some(
      (option: SelectedOption) =>
        option.name === optionName && option.value === optionValue,
    ),
  );
}

function buildVariantListingUrl(
  handle: string,
  selectedOptions: SelectedOption[],
) {
  const searchParams = new URLSearchParams();
  selectedOptions.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  return `/products/${handle}?${searchParams.toString()}`;
}

function appendColourToTitle(title: string, colour: string) {
  const normalizedTitle = title.trim();
  const normalizedColour = colour.trim();

  if (!normalizedColour) return normalizedTitle;
  if (normalizedTitle.toLowerCase().endsWith(normalizedColour.toLowerCase())) {
    return normalizedTitle;
  }

  return `${normalizedTitle} - ${normalizedColour}`;
}

function getBaseTitle(product: any) {
  return getMetafieldValue(product, 'base_title')?.trim() || product?.title || '';
}

function isColourOptionName(name?: string | null) {
  const normalized = name?.trim().toLowerCase();
  return normalized === 'color' || normalized === 'colour';
}

function getColourListingDetails(product: any) {
  return product?.__colourListing as ColourListingDetails | undefined;
}
