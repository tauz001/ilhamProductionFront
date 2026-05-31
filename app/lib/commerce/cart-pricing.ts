import {formatMoney} from './format-money';

/** Display-only shipping estimate (Shopify calculates real shipping at checkout). */
export function getDisplayShipping(
  subtotalAmount: number,
  currencyCode: string,
): {amount: number; label: string} {
  const freeThreshold = currencyCode === 'INR' ? 25000 : 25000;
  if (subtotalAmount === 0) {
    return {amount: 0, label: 'Complimentary'};
  }
  if (subtotalAmount >= freeThreshold) {
    return {amount: 0, label: 'Complimentary'};
  }
  const shippingAmount = currencyCode === 'INR' ? 850 : 850;
  return {
    amount: shippingAmount,
    label: formatMoney(shippingAmount, currencyCode),
  };
}

export function getDisplayTotal(
  subtotalAmount: number,
  currencyCode: string,
): number {
  const shipping = getDisplayShipping(subtotalAmount, currencyCode);
  return subtotalAmount + shipping.amount;
}
