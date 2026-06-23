import type {ShopifyCartLine} from './cart-lines';

export type MoneyLike = {
  amount?: string | number | null;
  currencyCode?: string | null;
} | null | undefined;

export type SalePricing = {
  compareAtAmount: number;
  currencyCode: string;
  onSale: boolean;
  priceAmount: number;
  saveAmount: number;
  savePercent: number;
};

export function getSalePricing(
  price: MoneyLike,
  compareAtPrice: MoneyLike,
): SalePricing | null {
  const priceAmount = moneyAmount(price);
  const compareAtAmount = moneyAmount(compareAtPrice);
  const currencyCode = price?.currencyCode || compareAtPrice?.currencyCode || 'INR';

  if (priceAmount === null) return null;

  const onSale =
    compareAtAmount !== null &&
    compareAtAmount > priceAmount &&
    sameCurrency(price, compareAtPrice);

  const saveAmount = onSale ? compareAtAmount - priceAmount : 0;

  return {
    compareAtAmount: compareAtAmount ?? priceAmount,
    currencyCode,
    onSale,
    priceAmount,
    saveAmount,
    savePercent:
      onSale && compareAtAmount
        ? Math.max(1, Math.round((saveAmount / compareAtAmount) * 100))
        : 0,
  };
}

export function getCartLineCompareAtSavings(line: ShopifyCartLine) {
  const quantity = Math.max(1, Number(line.quantity ?? 1));
  const unitPrice = line.cost?.amountPerQuantity ?? line.merchandise.price;
  const compareAt =
    line.cost?.compareAtAmountPerQuantity ?? line.merchandise.compareAtPrice;
  const sale = getSalePricing(unitPrice, compareAt);

  if (!sale?.onSale) return null;

  return {
    amount: sale.saveAmount * quantity,
    currencyCode: sale.currencyCode,
    percent: sale.savePercent,
  };
}

export function getCartCompareAtSavings(lines: ShopifyCartLine[]) {
  return lines.reduce(
    (total, line) => {
      const savings = getCartLineCompareAtSavings(line);
      if (!savings) return total;

      return {
        amount: total.amount + savings.amount,
        currencyCode: total.currencyCode || savings.currencyCode,
      };
    },
    {amount: 0, currencyCode: ''},
  );
}

function moneyAmount(money: MoneyLike) {
  const amount = Number(money?.amount);
  return Number.isFinite(amount) ? amount : null;
}

function sameCurrency(a: MoneyLike, b: MoneyLike) {
  if (!a?.currencyCode || !b?.currencyCode) return true;
  return a.currencyCode === b.currencyCode;
}
