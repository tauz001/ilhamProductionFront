import {Link} from 'react-router';
import {motion} from 'framer-motion';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  getLineProductType,
  getLineSizeLabel,
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
      className="grid grid-cols-[120px_1fr_auto] gap-6 py-8 md:grid-cols-[160px_1fr_auto] md:gap-10"
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
      <div className="flex flex-col">
        <p className="small-caps text-ink/45">{productType}</p>
        <Link
          to={`/products/${handle}`}
          className="mt-2 font-serif text-2xl text-ink hover:text-gold transition-colors"
        >
          {product.title}
        </Link>
        <p className="mt-1 text-xs italic text-ink/55">Size {sizeLabel}</p>
        <p className="mt-2 text-xs text-ink/50">
          Hand-embroidered over weeks in Lucknow. Each piece signed by its
          artisan.
        </p>
        <div className="mt-auto flex items-center gap-6 pt-6">
          <CartLineQuantityControls line={line} />
          <CartLineRemoveControl
            line={line}
            className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-ink transition-colors"
          />
        </div>
      </div>
      <div className="text-right">
        {lineTotal && (
          <p className="font-serif text-xl text-ink">
            {formatMoney(lineTotal.amount, lineTotal.currencyCode)}
          </p>
        )}
        {unitAmount && (
          <p className="mt-1 text-xs text-ink/45">
            {formatMoney(unitAmount.amount, unitAmount.currencyCode)} each
          </p>
        )}
      </div>
    </motion.li>
  );
}
