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

  const showSavingsCopy = size !== 'card';
  const compact = size === 'line';
  const saveAmount = formatMoney(sale.saveAmount, sale.currencyCode);
  const saleCopy = compact
    ? `Save ${saveAmount} - ${sale.savePercent}% off`
    : `You save ${saveAmount} (${sale.savePercent}% off)`;

  return (
    <div className={className}>
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
      {showSavingsCopy && (
        <div
          className={`mt-1 flex flex-wrap items-center gap-2 ${
            compact ? 'text-[10px]' : 'text-[11px]'
          } small-caps text-gold`}
        >
          {!compact && (
            <span className="border border-gold/30 bg-gold/10 px-2 py-1 text-[9px] text-gold">
              Limited atelier price
            </span>
          )}
          <span>{saleCopy}</span>
        </div>
      )}
    </div>
  );
}

function sizeClass(size: Props['size']) {
  if (size === 'pdp') return 'text-2xl';
  if (size === 'quick') return 'text-xl';
  if (size === 'card') return 'text-sm';
  return 'text-base';
}
