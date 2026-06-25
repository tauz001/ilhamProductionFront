import {isVariantPurchasable} from './variant-availability';

type ProductAvailability = {
  availableForSale?: boolean | null;
  selectedOrFirstAvailableVariant?: {availableForSale?: boolean | null} | null;
  variants?: {
    nodes?: Array<{availableForSale?: boolean | null}> | null;
  } | null;
};

export function isProductSoldOut(product?: ProductAvailability | null) {
  if (!product) return false;
  if (product.availableForSale === false) return true;
  if (product.availableForSale === true) return false;

  const variants = product.variants?.nodes ?? [];
  if (variants.length > 0) {
    return !variants.some(isVariantPurchasable);
  }

  if (product.selectedOrFirstAvailableVariant) {
    return !isVariantPurchasable(product.selectedOrFirstAvailableVariant);
  }

  return false;
}

export function compareProductsByAvailability(
  first?: ProductAvailability | null,
  second?: ProductAvailability | null,
) {
  return Number(isProductSoldOut(first)) - Number(isProductSoldOut(second));
}
