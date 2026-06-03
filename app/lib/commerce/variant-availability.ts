type VariantAvailability = {
  availableForSale?: boolean | null;
};

export function isVariantPurchasable(
  variant: VariantAvailability | null | undefined,
) {
  return Boolean(variant?.availableForSale);
}
