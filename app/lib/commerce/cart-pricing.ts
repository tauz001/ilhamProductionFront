/** Shopify confirms shipping and taxes after checkout has a delivery address. */
export function getDisplayShipping(
  _subtotalAmount?: number,
  _currencyCode?: string,
): {amount: number; label: string} {
  return {amount: 0, label: 'Calculated at checkout'};
}

export function getDisplayTotal(
  subtotalAmount: number,
  _currencyCode?: string,
): number {
  return subtotalAmount;
}
