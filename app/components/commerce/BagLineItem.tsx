import {Link} from 'react-router';
import {motion} from 'framer-motion';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  getLineProductType,
  getLineSizeLabel,
  hasCartLineIssue,
  type ShopifyCartLine,
} from '~/lib/commerce/cart-lines';
import {easeSilk} from '~/lib/motion/variants';
import {
  CartLineQuantityControls,
  CartLineRemoveControl,
} from './CartLineControls';

type Props = {
  line: ShopifyCartLine;
  layout: 'drawer' | 'page';
  index?: number;
  onNavigate?: () => void;
};

export function BagLineItem({line, layout, index = 0, onNavigate}: Props) {
  const {merchandise, cost, quantity} = line;
  const {product, image, title} = merchandise;
  const unitAmount = cost?.amountPerQuantity;
  const lineTotal = cost?.totalAmount;
  const handle = product.handle;
  const productType = getLineProductType(line);
  const sizeLabel = getLineSizeLabel(line);
  const hasIssue = hasCartLineIssue(line);
  const hasZeroQuantity = !quantity || quantity < 1;
  const merchandiseUnavailable = merchandise.availableForSale === false;
  const issueMessage = merchandiseUnavailable
    ? 'This size is no longer available. Remove it and choose another size.'
    : hasZeroQuantity
      ? 'This saved bag line has zero quantity. Increase it to 1 or remove it and add again.'
      : '';

  if (layout === 'drawer') {
    return (
      <li className="flex gap-5">
        <Link
          to={`/products/${handle}`}
          onClick={onNavigate}
          className="aspect-[3/4] w-24 shrink-0 overflow-hidden bg-cream"
        >
          {image?.url ? (
            <img
              src={image.url}
              alt={image.altText ?? title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-cream" />
          )}
        </Link>
        <div className="flex-1">
          <p className="font-serif text-lg">{product.title}</p>
          <p className="text-xs text-ink/55">Size {sizeLabel}</p>
          {hasIssue && (
            <p className="mt-2 text-xs text-destructive">
              {issueMessage}
            </p>
          )}
          {unitAmount && (
            <p className="mt-2 text-sm">
              {formatMoney(unitAmount.amount, unitAmount.currencyCode)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <CartLineQuantityControls line={line} compact />
            <CartLineRemoveControl
              line={line}
              className="text-xs text-ink/40 hover:text-ink"
            />
          </div>
        </div>
      </li>
    );
  }

  return (
    <motion.li
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.7, ease: easeSilk, delay: index * 0.06}}
      className="grid grid-cols-[92px_minmax(0,1fr)] gap-5 py-8 sm:grid-cols-[120px_minmax(0,1fr)] md:grid-cols-[160px_minmax(0,1fr)_auto] md:gap-10"
    >
      <Link
        to={`/products/${handle}`}
        className="aspect-[3/4] overflow-hidden bg-cream"
      >
        {image?.url ? (
          <img
            src={image.url}
            alt={image.altText ?? title}
            className="h-full w-full object-cover hover-silk"
          />
        ) : (
          <div className="h-full w-full bg-cream" />
        )}
      </Link>
      <div className="flex min-w-0 flex-col">
        <p className="small-caps text-ink/45">{productType}</p>
        <Link
          to={`/products/${handle}`}
          className="mt-2 break-words font-serif text-2xl leading-tight text-ink transition-colors hover:text-gold"
        >
          {product.title}
        </Link>
        <p className="mt-1 text-xs italic text-ink/55">Size {sizeLabel}</p>
        {hasIssue && (
          <p className="mt-3 border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {issueMessage}
          </p>
        )}
        <p className="mt-2 text-xs text-ink/50">
          Hand-embroidered over weeks in Lucknow. Each piece signed by its
          artisan.
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-6 sm:gap-6">
          <CartLineQuantityControls line={line} />
          <CartLineRemoveControl
            line={line}
            className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-ink transition-colors"
          />
        </div>
      </div>
      <div className="col-span-2 text-left md:col-auto md:text-right">
        {merchandiseUnavailable ? (
          <p className="font-serif text-xl text-destructive">Unavailable</p>
        ) : lineTotal ? (
          <p className="font-serif text-xl text-ink">
            {formatMoney(lineTotal.amount, lineTotal.currencyCode)}
          </p>
        ) : null}
        {unitAmount && (
          <p className="mt-1 text-xs text-ink/45">
            {formatMoney(unitAmount.amount, unitAmount.currencyCode)} each
          </p>
        )}
      </div>
    </motion.li>
  );
}
