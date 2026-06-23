import {formatMoney} from '~/lib/commerce/format-money';
import {getSalePricing, type MoneyLike} from '~/lib/commerce/pricing';

type Props = {
  className?: string;
  compareAtPrice?: MoneyLike;
  price?: MoneyLike;
  size?: 'card' | 'line' | 'pdp' | 'quick';
};

export function PriceWithSavings({
  className = '',
  compareAtPrice,
  price,
  size = 'line',
}: Props) {
  const sale = getSalePricing(price, compareAtPrice);
  if (!sale) return null;

  if (!sale.onSale) {
    return (
      <p className={`${sizeClass(size)} ${className}`}>
        {formatMoney(sale.priceAmount, sale.currencyCode)}
      </p>
    );
  }

  return (
    <div className={`${className}`}>
      <div
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${
          size === 'pdp' ? 'text-2xl' : sizeClass(size)
        }`}
      >
        <span>{formatMoney(sale.priceAmount, sale.currencyCode)}</span>
        <span className="text-[0.72em] text-ink/40 line-through">
          {formatMoney(sale.compareAtAmount, sale.currencyCode)}
        </span>
      </div>
      <p className="mt-1 text-[11px] small-caps text-gold">
        Save {formatMoney(sale.saveAmount, sale.currencyCode)} / {sale.savePercent}% off
      </p>
    </div>
  );
}

function sizeClass(size: Props['size']) {
  if (size === 'pdp') return 'text-2xl';
  if (size === 'quick') return 'text-xl';
  if (size === 'card') return 'text-sm';
  return 'text-base';
}
