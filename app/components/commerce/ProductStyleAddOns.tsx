import {Link} from 'react-router';
import {ArrowUpRight, Info, ShoppingBag} from 'lucide-react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PriceWithSavings} from '~/components/commerce/PriceWithSavings';
import {useStore} from '~/lib/commerce/cart-store';
import {shopifyImageUrl} from '~/lib/commerce/image';
import {isProductSoldOut} from '~/lib/commerce/product-availability';
import {getMetafieldValue} from '~/lib/commerce/shopify-fields';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';

type StyleAddOnKind = 'plazo' | 'dupatta';

type StyleAddOn = {
  badge?: string;
  kind: StyleAddOnKind;
  product: any;
};

type Props = {
  addOns: StyleAddOn[];
};

export function ProductStyleAddOns({addOns}: Props) {
  const validAddOns = addOns.filter(
    (addOn) => addOn.product?.handle && !isProductSoldOut(addOn.product),
  );

  if (!validAddOns.length) return null;

  return (
    <section
      aria-label="Style add-ons"
      className="mt-3 border border-border bg-cream/35 p-3 shadow-[0_18px_45px_rgba(28,22,17,0.05)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="small-caps text-ink/45">Style it with</p>
          <p className="mt-0.5 font-serif text-base leading-tight text-ink">
            Add only what completes the look.
          </p>
        </div>
        <button
          aria-label="Style add-on details"
          className="group relative grid h-8 w-8 shrink-0 place-items-center border border-border text-ink/45"
          type="button"
        >
          <Info className="h-3.5 w-3.5" strokeWidth={1.3} />
          <p className="pointer-events-none absolute right-0 top-9 z-20 w-56 border border-border bg-ivory p-3 text-xs leading-relaxed text-ink/60 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus:opacity-100">
            Plazo and dupatta are optional add-ons and are charged separately
            from this piece.
          </p>
        </button>
      </div>

      <div className="mt-3 grid gap-2">
        {validAddOns.map((addOn) => (
          <StyleAddOnCard
            addOn={addOn}
            key={`${addOn.kind}-${addOn.product.handle}`}
          />
        ))}
      </div>
    </section>
  );
}

function StyleAddOnCard({addOn}: {addOn: StyleAddOn}) {
  const openDrawer = useStore((state) => state.openDrawer);
  const {product} = addOn;
  const variants = product.variants?.nodes ?? [];
  const purchasableVariants = variants.filter(isVariantPurchasable);
  const variant = purchasableVariants[0] ?? variants[0];
  const image = getStyleAddOnImage(product, variant);
  const subtitle = getMetafieldValue(product, 'subtitle');
  const canAddDirectly =
    variant?.id &&
    isVariantPurchasable(variant) &&
    !requiresVariantChoice(product, variant);

  return (
    <article className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border border-border bg-ivory/75 p-2.5 transition-colors hover:border-gold/45 sm:grid-cols-[66px_minmax(0,1fr)]">
      <Link
        className="relative aspect-[3/4] overflow-hidden bg-cream"
        prefetch="intent"
        to={`/products/${product.handle}`}
      >
        {image?.url ? (
          <img
            alt={image.altText ?? product.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            decoding="async"
            loading="lazy"
            src={shopifyImageUrl(image.url, 240)}
          />
        ) : null}
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="small-caps text-[10px] text-gold">
              {addOn.kind === 'plazo' ? 'Plazo add-on' : 'Dupatta add-on'}
            </p>
            <Link prefetch="intent" to={`/products/${product.handle}`}>
              <h3 className="mt-0.5 line-clamp-1 font-serif text-base leading-tight text-ink transition-colors hover:text-gold">
                {product.title}
              </h3>
            </Link>
          </div>
          {addOn.badge ? (
            <span className="shrink-0 border border-gold/30 bg-gold/10 px-2 py-1 text-[8px] small-caps text-gold">
              {addOn.badge}
            </span>
          ) : null}
        </div>

        {subtitle ? (
          <p className="mt-1 line-clamp-1 text-xs italic text-ink/50">
            {subtitle}
          </p>
        ) : null}

        <PriceWithSavings
          className="mt-2 text-sm text-ink/75"
          compareAtPrice={variant?.compareAtPrice}
          price={variant?.price ?? product.priceRange?.minVariantPrice}
          size="card"
        />

        <div className="mt-2">
          {canAddDirectly ? (
            <AddToCartButton
              className="inline-flex"
              lines={[
                {
                  merchandiseId: variant.id,
                  quantity: 1,
                  selectedVariant: variant,
                },
              ]}
              onClick={() => openDrawer('cart')}
            >
              <span className="inline-flex h-8 items-center gap-2 border border-ink bg-ink px-3 text-[9px] small-caps text-ivory transition-colors hover:border-gold hover:bg-gold">
                <ShoppingBag className="h-3 w-3" strokeWidth={1.4} />
                Add piece
              </span>
            </AddToCartButton>
          ) : (
            <Link
              className="inline-flex h-8 items-center gap-2 border border-border px-3 text-[9px] small-caps text-ink/70 transition-colors hover:border-ink hover:text-ink"
              prefetch="intent"
              to={`/products/${product.handle}`}
            >
              Choose size
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.3} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function getStyleAddOnImage(product: any, variant: any) {
  return (
    variant?.image ??
    product.featuredImage ??
    product.images?.nodes?.find((image: any) => image?.url) ??
    null
  );
}

function requiresVariantChoice(product: any, variant: any) {
  const variantCount = product.variantsCount?.count ?? product.variants?.nodes?.length ?? 0;

  if (variantCount > 1) return true;

  return Boolean(
    variant?.selectedOptions?.some(
      (option: {name?: string | null; value?: string | null}) =>
        !(
          option.name?.toLowerCase() === 'title' &&
          option.value?.toLowerCase() === 'default title'
        ),
    ),
  );
}
