import {Link} from 'react-router';
import {AnimatePresence} from 'framer-motion';
import {Heart, ShoppingBag} from 'lucide-react';
import {lazy, Suspense, useEffect, useState} from 'react';
import {useStore} from '~/lib/commerce/cart-store';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PriceWithSavings} from './PriceWithSavings';
import {
  getMetafieldValue,
  logMissingShopifyField,
  tagIncludes,
} from '~/lib/commerce/shopify-fields';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';
import {isProductSoldOut} from '~/lib/commerce/product-availability';
import {
  CARD_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import {prefetchQuickViewProduct} from '~/lib/commerce/quick-view';

let quickViewModulePromise: ReturnType<typeof importQuickViewModule> | null = null;
let quickViewPreloadScheduled = false;

function importQuickViewModule() {
  return import('./QuickViewModal');
}

function preloadQuickViewModule() {
  quickViewModulePromise ??= importQuickViewModule();
  return quickViewModulePromise;
}

function scheduleQuickViewModulePreload() {
  if (quickViewPreloadScheduled || typeof window === 'undefined') return;
  quickViewPreloadScheduled = true;

  const preload = () => void preloadQuickViewModule();
  const idleWindow = window as Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
  };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(preload, {timeout: 2500});
  } else {
    globalThis.setTimeout(preload, 1800);
  }
}

const QuickViewModal = lazy(() =>
  preloadQuickViewModule().then((module) => ({
    default: module.QuickViewModal,
  })),
);

type Props = {
  product: any;
  index?: number;
  aspect?: 'tall' | 'square';
  priority?: boolean;
};

export function ProductCard({
  product,
  aspect = 'tall',
  priority = false,
}: Props) {
  const wishlist = useStore((s) => s.wishlist);
  const toggle = useStore((s) => s.toggleWishlist);
  const saved = wishlist.includes(product.handle);
  const openDrawer = useStore((s) => s.openDrawer);

  const hoverImages = getHoverImages(product);
  const displayImages = hoverImages.slice(0, 2);
  const firstImage = hoverImages[0];
  const [hovering, setHovering] = useState(false);
  const [imageIntent, setImageIntent] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const activeImageIndex = hovering && displayImages.length > 1 ? 1 : 0;

  const subtitle = getMetafieldValue(product, 'subtitle');
  const variants = product.variants?.nodes ?? [];
  const purchasableVariants = variants.filter(isVariantPurchasable);
  const variant =
    product.selectedOrFirstAvailableVariant ??
    purchasableVariants[0] ??
    variants[0];
  const soldOut = isProductSoldOut(product);
  const variantId = variant?.id;
  const variantCount = product.variantsCount?.count ?? variants.length;
  const requiresVariantSelection = shouldChooseVariantOnPdp(
    variants,
    variantCount,
    variant,
  );
  const canAddToBag = Boolean(
    variantId &&
      isVariantPurchasable(variant) &&
      !requiresVariantSelection &&
      !soldOut,
  );
  const isNew =
    tagIncludes(product.tags, 'new-arrival') ||
    tagIncludes(product.tags, 'new');
  const price = variant?.price ?? product.priceRange?.minVariantPrice;
  const compareAtPrice = variant?.compareAtPrice;

  const prepareQuickView = () => {
    if (canAddToBag || soldOut) return;
    void preloadQuickViewModule();
    prefetchQuickViewProduct(product.handle);
  };

  if (!firstImage) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.featuredImage or product.images',
      'Add at least one product image in Shopify Admin so product cards can match the TanStack gallery UI.',
    );
  }
  if (!subtitle) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.subtitle',
      'Create a product metafield custom.subtitle in Shopify Admin for the product card subtitle.',
    );
  }
  if (!variantId) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.variants',
      'Add at least one product variant in Shopify Admin so Add to bag can use Shopify cart lines.',
    );
  }

  useEffect(() => {
    if (!canAddToBag && !soldOut) scheduleQuickViewModulePreload();
  }, [canAddToBag, soldOut]);

  const activateCardIntent = () => {
    prepareQuickView();
    setImageIntent(true);
    setHovering(true);
  };

  return (
    <div
        className="group block min-w-0"
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          activateCardIntent();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'touch') return;
          setHovering(false);
        }}
        onFocusCapture={(event) => {
          const target = event.target as HTMLElement;
          if (target.matches(':focus-visible')) activateCardIntent();
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHovering(false);
          }
        }}
      >
        <div
          className={`relative overflow-hidden bg-cream ${
            aspect === 'tall'
              ? 'aspect-[3/4]'
              : 'aspect-square'
          }`}
        >
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            aria-label={`View ${product.title}${soldOut ? ' (sold out)' : ''}`}
            className="absolute inset-0 z-10"
          />

          {displayImages.map((image: any, i: number) => {
            if (i > 0 && !imageIntent) return null;

            return (
              <img
                key={image.id ?? image.url}
                src={shopifyImageUrl(image.url, 640)}
                srcSet={shopifySrcSet(image.url, CARD_IMAGE_WIDTHS)}
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 33vw, 50vw"
                alt={i === 0 ? image.altText ?? product.title : ''}
                loading={i === 0 && priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 && priority ? 'high' : 'low'}
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
                  i === activeImageIndex ? 'opacity-100' : 'opacity-0'
                } ${soldOut ? 'saturate-[0.72]' : ''}`}
              />
            );
          })}

          {soldOut ? (
            <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-ink/10">
              <span className="border border-ivory/70 bg-ivory/90 px-4 py-2 text-[10px] text-ink/70 shadow-[0_12px_30px_rgba(28,22,17,0.14)] small-caps">
                Sold out
              </span>
            </div>
          ) : null}
    
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggle(product.handle);
            }}
            aria-label={
              saved
                ? 'Remove from wishlist'
                : 'Save to wishlist'
            }
            className="absolute top-4 right-4 z-20 p-1.5 text-ink/70 hover:text-gold transition-colors"
          >
            <Heart
              className="h-4 w-4"
              strokeWidth={1.2}
              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
    
          {isNew && !soldOut && (
            <span className="absolute top-4 left-4 z-20 small-caps text-ink/60">
              New
            </span>
          )}
    
          <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 translate-y-full opacity-0 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            {soldOut ? (
              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
                className="flex h-14 w-full items-center justify-center border border-ivory/20 bg-ivory/95 text-ink shadow-[0_16px_36px_rgba(0,0,0,0.18)] small-caps transition-colors hover:border-gold hover:text-gold"
              >
                View details
              </Link>
            ) : canAddToBag ? (
              <AddToCartButton
                className="block w-full"
                lines={[
                  {
                    merchandiseId: variantId,
                    quantity: 1,
                    selectedVariant: variant,
                  },
                ]}
                onClick={() => openDrawer('cart')}
              >
                <div className="flex h-14 w-full items-center justify-center gap-3 border border-ivory/15 bg-ink/95 text-ivory shadow-[0_16px_36px_rgba(0,0,0,0.22)] small-caps hover:border-gold hover:bg-gold transition-colors cursor-pointer sm:backdrop-blur-sm">
                  <ShoppingBag
                    className="h-3.5 w-3.5"
                    strokeWidth={1.4}
                  />
                  Add to bag
                </div>
              </AddToCartButton>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  prepareQuickView();
                  setQuickViewOpen(true);
                }}
                onPointerDown={prepareQuickView}
                className="flex h-14 w-full items-center justify-center border border-ivory/15 bg-ink/95 text-ivory shadow-[0_16px_36px_rgba(0,0,0,0.22)] small-caps transition-colors hover:border-gold hover:bg-gold sm:backdrop-blur-sm"
              >
                Choose piece
              </button>
            )}
          </div>
        </div>
    
        <div className="mt-4 flex min-w-0 flex-col gap-1.5 sm:mt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.handle}`} prefetch="intent">
              <p className="line-clamp-2 overflow-hidden font-serif text-base leading-[1.08] text-ink transition-colors [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] hover:text-gold sm:text-xl sm:leading-tight">
                {product.title}
              </p>
            </Link>
    
            <p className="mt-1 line-clamp-1 text-[11px] italic text-ink/55 sm:text-xs">
              {subtitle}
            </p>
          </div>
    
          <PriceWithSavings
            className="self-start whitespace-nowrap text-ink/80 sm:shrink-0"
            compareAtPrice={compareAtPrice}
            price={price}
            size="card"
          />
        </div>
        <AnimatePresence initial={false}>
          {quickViewOpen ? (
            <Suspense key="quick-view" fallback={<QuickViewLoadingShell />}>
              <QuickViewModal
                initialProduct={product}
                productHandle={product.handle}
                onClose={() => setQuickViewOpen(false)}
              />
            </Suspense>
          ) : null}
        </AnimatePresence>
      </div>
    );
}

function QuickViewLoadingShell() {
  return (
    <div className="fixed inset-0 z-[96] flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-6">
      <div className="grid min-h-[620px] max-h-[94svh] w-full overflow-hidden border border-border bg-ivory shadow-soft sm:max-w-4xl md:grid-cols-2">
        <div className="skeleton-luxury min-h-[360px] md:min-h-[620px]" />
        <div className="p-8 pt-20">
          <div className="h-12 w-4/5 skeleton-luxury" />
          <div className="mt-4 h-4 w-1/2 skeleton-luxury" />
          <div className="mt-12 h-10 w-full skeleton-luxury" />
        </div>
      </div>
    </div>
  );
}

function getHoverImages(product: any) {
  const seen = new Set<string>();
  const images = [
    ...(product.images?.nodes ?? []),
    product.featuredImage,
  ].filter((image) => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });

  return images.slice(0, 2);
}

function shouldChooseVariantOnPdp(
  variants: any[],
  variantCount: number,
  selectedVariant: any,
) {
  if (variantCount > 1) return true;

  const purchasable = variants.filter(isVariantPurchasable);
  if (purchasable.length > 1) return true;
  const onlyVariant = purchasable[0] ?? selectedVariant;

  return Boolean(
    onlyVariant?.selectedOptions?.some(
      (option: {name: string; value: string}) =>
        !(
          option.name.toLowerCase() === 'title' &&
          option.value.toLowerCase() === 'default title'
        ),
    ),
  );
}
