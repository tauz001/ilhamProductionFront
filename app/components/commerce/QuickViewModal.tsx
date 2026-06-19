import {useEffect, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import {AnimatePresence, motion} from 'framer-motion';
import {LoaderCircle, ShoppingBag, X} from 'lucide-react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {formatMoney} from '~/lib/commerce/format-money';
import {getMetafieldValue} from '~/lib/commerce/shopify-fields';
import {
  buildVariantOptionGroups,
} from '~/lib/commerce/selected-variant';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';
import {
  CARD_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import {useStore} from '~/lib/commerce/cart-store';
import {easeSilk} from '~/lib/motion/variants';

type Props = {
  onClose: () => void;
  productHandle: string;
};

export function QuickViewModal({onClose, productHandle}: Props) {
  const fetcher = useFetcher();

  useEffect(() => {
    void fetcher.load(
      `/api/product-quick-view?handle=${encodeURIComponent(productHandle)}`,
    );
  }, [fetcher, productHandle]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const data = fetcher.data as
    | {message?: string; product?: any}
    | undefined;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[96] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        role="presentation"
        onClick={onClose}
      >
        <motion.div
          initial={{y: 30, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 30, opacity: 0}}
          transition={{duration: 0.42, ease: easeSilk}}
          className="relative max-h-[94svh] w-full overflow-y-auto border border-border bg-ivory shadow-soft sm:max-w-4xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center border border-border bg-ivory/90 text-ink transition-colors hover:border-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.4} />
          </button>

          {data?.product ? (
            <QuickViewContent product={data.product} onClose={onClose} />
          ) : data?.message ? (
            <div className="grid min-h-80 place-items-center p-8 text-center">
              <div>
                <p className="font-serif text-2xl text-ink">Quick view unavailable.</p>
                <p className="mt-2 text-sm text-ink/55">{data.message}</p>
                <Link
                  to={`/products/${productHandle}`}
                  prefetch="intent"
                  className="mt-6 inline-flex h-11 items-center border border-ink px-5 small-caps text-ink"
                >
                  View details
                </Link>
              </div>
            </div>
          ) : (
            <QuickViewSkeleton />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function QuickViewContent({
  onClose,
  product,
}: {
  onClose: () => void;
  product: any;
}) {
  const variants = product.variants?.nodes ?? [];
  const firstAvailableIndex = Math.max(
    0,
    variants.findIndex(isVariantPurchasable),
  );
  const [variantIndex, setVariantIndex] = useState(firstAvailableIndex);
  const selectedVariant = variants[variantIndex] ?? variants[firstAvailableIndex];
  const selectedVariantPurchasable = isVariantPurchasable(selectedVariant);
  const optionGroups = buildVariantOptionGroups(variants, selectedVariant);
  const image =
    selectedVariant?.image ??
    product.featuredImage ??
    product.images?.nodes?.[0];
  const price = selectedVariant?.price ?? product.priceRange?.minVariantPrice;
  const subtitle = getMetafieldValue(product, 'subtitle');
  const fabric = getMetafieldValue(product, 'fabric');
  const openDrawer = useStore((state) => state.openDrawer);

  return (
    <div className="grid md:grid-cols-[1fr_1fr]">
      <div className="min-h-[360px] bg-cream md:min-h-[620px]">
        {image?.url ? (
          <img
            src={shopifyImageUrl(image.url, 960)}
            srcSet={shopifySrcSet(image.url, CARD_IMAGE_WIDTHS)}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={image.altText ?? product.title}
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            decoding="async"
            className="h-full min-h-[360px] w-full object-cover md:min-h-[620px]"
          />
        ) : null}
      </div>

      <div className="flex flex-col p-6 pt-16 sm:p-10 sm:pt-16">
        <p className="small-caps text-ink/45">
          {product.productType || product.vendor || 'ilham'}
        </p>
        <h2 id="quick-view-title" className="mt-3 font-display text-4xl leading-none text-ink sm:text-5xl">
          {product.title}
        </h2>
        {subtitle ? (
          <p className="mt-2 font-serif text-lg italic text-ink/55">{subtitle}</p>
        ) : null}
        {price ? (
          <p className="mt-5 text-xl text-ink">
            {formatMoney(price.amount, price.currencyCode)}
          </p>
        ) : null}
        {fabric ? (
          <p className="mt-3 text-xs leading-relaxed text-ink/50">{fabric}</p>
        ) : null}

        <div className="mt-7 space-y-5">
          {optionGroups.map((option) => (
            <div key={option.name}>
              <p className="small-caps text-ink/50">{option.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={`${option.name}-${value.value}`}
                    type="button"
                    disabled={!value.available || value.variantIndex < 0}
                    onClick={() => setVariantIndex(value.variantIndex)}
                    className={`h-10 min-w-10 border px-3 text-sm transition-colors ${
                      value.selected
                        ? 'border-ink bg-ink text-ivory'
                        : value.available
                          ? 'border-border hover:border-ink'
                          : 'cursor-not-allowed border-border text-ink/30 line-through'
                    }`}
                  >
                    {value.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <AddToCartButton
            disabled={!selectedVariantPurchasable}
            lines={
              selectedVariant && selectedVariantPurchasable
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: 1,
                      selectedVariant,
                    },
                  ]
                : []
            }
            onClick={() => {
              onClose();
              openDrawer('cart');
            }}
            className="block w-full"
          >
            <span className="flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/35">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
              {selectedVariantPurchasable ? 'Add to bag' : 'Sold out'}
            </span>
          </AddToCartButton>
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            onClick={onClose}
            className="mt-3 flex h-12 w-full items-center justify-center border border-border small-caps text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="grid min-h-[620px] md:grid-cols-2" aria-label="Loading quick view">
      <div className="skeleton-luxury min-h-[360px] md:min-h-[620px]" />
      <div className="p-8 pt-20">
        <LoaderCircle className="h-5 w-5 animate-spin text-gold" strokeWidth={1.4} />
        <div className="mt-8 h-12 w-4/5 skeleton-luxury" />
        <div className="mt-4 h-4 w-1/2 skeleton-luxury" />
        <div className="mt-12 h-10 w-full skeleton-luxury" />
      </div>
    </div>
  );
}
