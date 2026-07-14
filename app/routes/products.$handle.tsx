import {Await, Link, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {ChevronDown, Heart, Minus, Plus} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {DiscountTicket} from '~/components/commerce/DiscountTicket';
import {PriceWithSavings} from '~/components/commerce/PriceWithSavings';
import {ProductAssurancePanel} from '~/components/commerce/ProductAssurancePanel';
import {ProductCard} from '~/components/commerce/ProductCard';
import {
  ProductColourLinks,
  type ProductColourLink,
} from '~/components/commerce/ProductColourLinks';
import {ProductImageCarousel} from '~/components/commerce/ProductImageCarousel';
import {ProductStyleAddOns} from '~/components/commerce/ProductStyleAddOns';
import {SizeAndFitGuide} from '~/components/commerce/SizeAndFitGuide';
import {JsonLd} from '~/components/seo/JsonLd';
import {FadeUp} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {useStore} from '~/lib/commerce/cart-store';
import {easeSilk} from '~/lib/motion/variants';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  getMetafieldImage,
  getMetafieldValue,
  logMissingShopifyField,
  parseListField,
} from '~/lib/commerce/shopify-fields';
import {isProductSoldOut} from '~/lib/commerce/product-availability';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';
import {
  buildVariantOptionGroups,
  getOptionValue,
} from '~/lib/commerce/selected-variant';
import {
  getFabricTransparencyNote,
  getWashCareForFabric,
} from '~/lib/commerce/product-guidance';
import {fetchFeaturedDiscountOffer} from '~/lib/commerce/discount-ticket.server';
import {
  PDP_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import {breadcrumbJsonLd, productJsonLd, seoMeta} from '~/lib/seo';
import {
  expandColourVariantListings,
  getProductListingKey,
  getSplitColourProductTitle,
} from '~/lib/commerce/colour-listings';
import {
  getColourMediaImages,
  getVariantColour,
} from '~/lib/commerce/colour-media';

type RecommendedProduct = {
  handle: string;
  title: string;
  id?: string | null;
  [key: string]: unknown;
};

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return seoMeta({
    title: product?.seo?.title || (product ? `${product.title} - ilham` : 'Product - ilham'),
    description:
      product?.seo?.description ?? product?.description ?? 'Handcrafted Lucknowi chikankari from ilham.',
    path: product ? `/products/${product.handle}` : '/products',
    image: product?.featuredImage?.url ?? product?.images?.nodes?.[0]?.url,
    type: 'product',
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});
  logProductRequirements(product);

  const recommendations = storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {productId: product.id},
    })
    .then(async (result) => {
      const recommendedProducts = normalizeRecommendations(
        result?.productRecommendations,
      );
      if (recommendedProducts.length) return recommendedProducts;

      const fallbackResult = await storefront.query(
        PRODUCT_RECOMMENDATIONS_FALLBACK_QUERY,
        {
          variables: {first: 8},
        },
      );

      return normalizeRecommendations(fallbackResult?.products?.nodes)
        .filter((recommended) => recommended.handle !== product.handle)
        .slice(0, 4);
    })
    .catch((error: Error) => {
      console.error('[product] Shopify productRecommendations query failed:', error);
      return [];
    });

  return {
    discountOffer: fetchFeaturedDiscountOffer(context.env),
    product,
    recommendations,
  };
}

export default function Product() {
  const {discountOffer, product, recommendations} =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(
    () => product.variants?.nodes ?? [],
    [product.variants?.nodes],
  );
  const firstAvailableIndex = getDefaultVariantIndex(variants);
  const selectedUrlVariantIndex = getVariantIndexFromSearchParams(
    variants,
    searchParams,
  );
  const [variantIdx, setVariantIdx] = useState(
    selectedUrlVariantIndex >= 0 ? selectedUrlVariantIndex : firstAvailableIndex,
  );
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>('fabric');
  const productGalleryRef = useRef<HTMLDivElement | null>(null);
  const wishlist = useStore((s) => s.wishlist);
  const toggleW = useStore((s) => s.toggleWishlist);
  const openDrawer = useStore((s) => s.openDrawer);
  const saved = wishlist.includes(product.handle);
  const selectedVariant = variants[variantIdx] ?? variants[firstAvailableIndex];
  const displayProductTitle = getSplitColourProductTitle(
    product,
    selectedVariant,
  );
  const selectedVariantPurchasable = isVariantPurchasable(selectedVariant);
  const connectedColourOptions = buildConnectedColourOptions(product);
  const hasConnectedColours = connectedColourOptions.length > 1;
  const optionGroups = buildVariantOptionGroups(variants, selectedVariant).filter(
    (option) => !(hasConnectedColours && isColorOptionName(option.name)),
  );
  const price = selectedVariant?.price ?? product.priceRange?.minVariantPrice;
  const categoryLabel = product.productType || product.vendor;
  const images = product.images?.nodes ?? [];
  const galleryImages = getUniqueImages([product.featuredImage, ...images]);
  const subtitle = getRequiredMetafield(product, 'subtitle');
  const fabric = getRequiredMetafield(product, 'fabric');
  const care = getRequiredMetafield(product, 'care');
  const washCare = getWashCareForFabric(
    fabric,
    getMetafieldValue(product, 'wash_care') ?? care,
  );
  const fabricTransparencyNote = getFabricTransparencyNote(fabric);
  const craftHours = getRequiredMetafield(product, 'craft_hours');
  const artisan = getRequiredMetafield(product, 'artisan');
  const origin = getRequiredMetafield(product, 'origin');
  const shippingReturns = getRequiredMetafield(product, 'shipping_returns');
  const giftingNote = getRequiredMetafield(product, 'gifting_note');
  const fabricDetailMetafieldImage = getMetafieldImage(
    product,
    'fabric_detail_image',
  );
  const fabricDetailImage = getFirstUniqueImage(
    [fabricDetailMetafieldImage],
    galleryImages,
  );
  const selectedVariantImage = selectedVariant?.image?.url
    ? selectedVariant.image
    : null;
  const selectedColour = getVariantColour(selectedVariant);
  const selectedColourImages = getColourMediaImages(
    galleryImages,
    selectedColour,
  );
  const hasColourMediaGroup = selectedColourImages.length > 0;
  const carouselImages = hasColourMediaGroup
    ? getUniqueImages(selectedColourImages)
    : getUniqueImages([
        selectedVariantImage,
        ...galleryImages,
        fabricDetailImage,
      ]);
  const activeCarouselImageKey = getImageKey(
    (hasColourMediaGroup ? selectedColourImages[0] : selectedVariantImage) ??
      product.featuredImage ??
      galleryImages[0],
  );
  const artisanImage =
    getMetafieldImage(product, 'artisan_image') ?? galleryImages[3] ?? null;
  const occasions = parseListField(getMetafieldValue(product, 'occasions'));
  const selectedFabric = getOptionValue(selectedVariant, 'Fabric');
  const productDescription = buildProductDescription({
    description: product.description,
    fabric,
    product,
    selectedFabric,
    washCare,
  });
  const styleAddOns = buildProductStyleAddOns(product);

  useEffect(() => {
    const nextIndex = getVariantIndexFromSearchParams(variants, searchParams);
    const resolvedIndex = nextIndex >= 0 ? nextIndex : firstAvailableIndex;
    setVariantIdx((current) =>
      current === resolvedIndex ? current : resolvedIndex,
    );
  }, [firstAvailableIndex, searchParams, variants]);

  const scrollToProductGalleryOnMobile = () => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(min-width: 768px)').matches
    ) {
      return;
    }

    window.requestAnimationFrame(() => {
      productGalleryRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    });
  };

  const selectVariantIndex = (
    nextIndex: number,
    options?: {scrollToGallery?: boolean},
  ) => {
    const nextVariant = variants[nextIndex];
    if (!nextVariant) return;

    setVariantIdx(nextIndex);
    setSearchParams(
      getSearchParamsForVariant(searchParams, variants, nextVariant),
      {
        preventScrollReset: true,
        replace: true,
      },
    );

    if (options?.scrollToGallery) {
      scrollToProductGalleryOnMobile();
    }
  };

  if (!fabricDetailMetafieldImage && galleryImages.length < 2) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.fabric_detail_image',
      'Add a file reference metafield custom.fabric_detail_image or additional product images in Shopify Admin for the fabric detail section.',
    );
  }
  if (!artisanImage) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.artisan_image',
      'Add a file reference metafield custom.artisan_image or an additional product image in Shopify Admin for the artisan story section.',
    );
  }
  if (!product.productType) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.productType',
      'Set Product type in Shopify Admin so the product page can show the TanStack category label.',
    );
  }

  const accordionSections = [
    {
      id: 'fabric',
      title: 'Fabric & care',
      body: [fabric, fabricTransparencyNote, washCare]
        .filter(Boolean)
        .join('. '),
    },
    {
      id: 'craft',
      title: 'The craft',
      body: [
        craftHours ? `${craftHours}+ hours of hand embroidery` : '',
        artisan ? `by ${artisan}` : '',
        origin ? `in ${origin}` : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      id: 'shipping',
      title: 'Shipping & returns',
      body: shippingReturns,
    },
    {
      id: 'gifting',
      title: 'Gifting',
      body: giftingNote,
    },
  ].filter((section) => section.body);

  return (
    <div className="overflow-x-hidden pb-32 pt-24 md:pb-0 md:pt-28">
      <section className="mx-auto grid max-w-[1500px] gap-6 px-4 sm:px-6 md:grid-cols-12 md:items-start lg:px-12">
        <div ref={productGalleryRef} className="min-w-0 md:col-span-7">
          <ProductImageCarousel
            activeImageKey={activeCarouselImageKey}
            images={carouselImages}
            productTitle={product.title}
          />
        </div>

        <aside className="min-w-0 md:col-span-5 md:sticky md:top-20 md:self-start md:pl-6 lg:pl-8">
          <p className="small-caps text-ink/50">{categoryLabel}</p>
          <h1 className="mt-1.5 break-words font-display text-3xl leading-none sm:text-4xl md:text-5xl xl:text-[3.35rem]">
            {displayProductTitle}
          </h1>
          {subtitle && (
            <p className="mt-1 font-serif italic text-lg text-ink/60">
              {subtitle}
            </p>
          )}
          <PriceWithSavings
            className="mt-3"
            compareAtPrice={selectedVariant?.compareAtPrice}
            price={price}
            size="pdp"
          />
          <p className="mt-1 text-xs text-ink/45">
            Inclusive of all taxes. Checkout and shipping calculated by Shopify
          </p>
          <div className="mt-4 h-px bg-border" />

          <ProductColourLinks options={connectedColourOptions} />

          {optionGroups.length > 0 && (
            <div className="mt-4 space-y-3">
              {optionGroups.map((option) => (
                <div key={option.name}>
                  <p className="small-caps text-ink/50">{option.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={`${option.name}-${value.value}`}
                        type="button"
                        onClick={() => {
                          if (value.available && value.variantIndex >= 0) {
                            selectVariantIndex(value.variantIndex, {
                              scrollToGallery: isColorOptionName(option.name),
                            });
                          }
                        }}
                        disabled={!value.available || value.variantIndex < 0}
                        className={`h-9 min-w-9 border px-3 text-xs transition-colors ${
                          value.selected
                            ? 'border-ink bg-ink text-ivory'
                            : value.available
                              ? 'border-border hover:border-ink'
                              : 'border-border text-ink/30 line-through cursor-not-allowed'
                        }`}
                      >
                        {value.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-[92px_minmax(0,1fr)_44px] gap-2">
            <div className="flex h-11 w-full items-center justify-center border border-border">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-2 text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((current) => current + 1)}
                className="px-3"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <AddToCartButton
              disabled={!selectedVariantPurchasable}
              lines={
                selectedVariant && selectedVariantPurchasable
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: qty,
                        selectedVariant,
                      },
                    ]
                  : []
              }
              onClick={() => openDrawer('cart')}
              className="min-w-0"
            >
              <span className="flex h-11 w-full items-center justify-center bg-ink px-4 small-caps text-ivory transition-colors hover:bg-gold sm:px-8">
                {selectedVariantPurchasable ? 'Add to bag' : 'Sold out'}
              </span>
            </AddToCartButton>
            <button
              type="button"
              onClick={() => toggleW(product.handle)}
              aria-label="Wishlist"
              className="flex h-11 w-full shrink-0 items-center justify-center border border-border hover:border-ink"
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.2}
                fill={saved ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <ProductStyleAddOns addOns={styleAddOns} />

          <SizeAndFitGuide
            product={product}
            selectedSize={getOptionValue(selectedVariant, 'Size')}
          />

          {occasions.length > 0 && (
            <p className="mt-4 text-xs italic text-ink/50">
              {occasions.join(' / ')}
            </p>
          )}

          <ProductDeferredBoundary
            key={`${product.handle}-discount`}
            label="discount ticket"
          >
            <Suspense fallback={null}>
              <Await resolve={discountOffer} errorElement={null}>
                {(offer) => (
                  <DiscountTicket
                    className="mt-4"
                    offer={offer}
                    redirectTo={`/products/${product.handle}`}
                  />
                )}
              </Await>
            </Suspense>
          </ProductDeferredBoundary>

          <ProductAssurancePanel priceAmount={price?.amount} />

          {accordionSections.length > 0 && (
            <div className="mt-10 space-y-2 border-t border-border">
              {accordionSections.map((section) => (
                <div key={section.id} className="border-b border-border">
                  <button
                    className="flex w-full items-center justify-between py-5 text-left"
                    onClick={() =>
                      setOpenSection(openSection === section.id ? null : section.id)
                    }
                  >
                    <span className="small-caps text-ink/80">{section.title}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        openSection === section.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openSection === section.id && (
                      <motion.p
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.5, ease: easeSilk}}
                        className="pb-5 text-sm text-ink/65 overflow-hidden"
                      >
                        {section.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      {(productDescription.specs.length > 0 ||
        productDescription.notes.length > 0) && (
        <section className="mx-auto mt-24 max-w-[1500px] border-t border-border px-4 pt-16 sm:px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="small-caps text-ink/50">Product description</p>
              <h2 className="mt-5 break-words font-display text-4xl md:text-6xl">
                Everything to know before the drape.
              </h2>
              {productDescription.specs.length > 0 && (
                <div className="mt-10 border border-border bg-cream/35">
                  {productDescription.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] border-b border-border last:border-b-0"
                    >
                      <p className="border-r border-border px-4 py-4 small-caps text-[10px] text-ink/45 sm:px-5">
                        {spec.label}
                      </p>
                      <p className="px-4 py-4 text-sm leading-relaxed text-ink/72 sm:px-5">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="divide-y divide-border">
              {productDescription.notes.map((section) => (
                <article
                  key={section.title}
                  className="grid gap-5 py-8 md:grid-cols-[160px_minmax(0,1fr)] first:pt-0"
                >
                  <h3 className="small-caps text-ink/50">{section.title}</h3>
                  <div className="text-sm leading-relaxed text-ink/70">
                    {section.body}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {(artisanImage?.url || artisan || craftHours) && (
        <section className="mx-auto mt-32 grid max-w-[1500px] gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-12">
          {artisanImage?.url && (
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={shopifyImageUrl(artisanImage.url, 1280)}
                srcSet={shopifySrcSet(artisanImage.url, PDP_IMAGE_WIDTHS)}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={artisan ? `${artisan}, artisan` : 'Artisan'}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width={artisanImage.width ?? undefined}
                height={artisanImage.height ?? undefined}
              />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <p className="small-caps text-ink/50">The hands behind {product.title}</p>
            <h2 className="mt-6 break-words font-display text-4xl text-balance sm:text-5xl">
              {craftHours && artisan ? (
                <>
                  Handcrafted over{' '}
                  <em className="italic font-serif">{craftHours}+ hours</em> by {artisan}.
                </>
              ) : (
                product.title
              )}
            </h2>
            {origin && (
              <p className="mt-6 text-ink/65 leading-relaxed">
                {origin}
              </p>
            )}
            <ChikanMotif className="mt-10 h-6 w-40 text-gold self-start" />
          </div>
        </section>
      )}

      <ProductDeferredBoundary
        key={`${product.handle}-recommendations`}
        label="recommendations"
      >
        <Suspense fallback={<ProductRecommendationsSkeleton />}>
          <Await resolve={recommendations} errorElement={null}>
            {(resolvedRecommendations) => (
              <ProductRecommendations
                recommendations={normalizeRecommendations(
                  resolvedRecommendations,
                )}
              />
            )}
          </Await>
        </Suspense>
      </ProductDeferredBoundary>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: qty,
            },
          ],
        }}
      />
      <JsonLd data={productJsonLd(product, selectedVariant)} />
      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', url: '/'},
          {name: product.title, url: `/products/${product.handle}`},
        ])}
      />
      <MobilePurchaseDock
        addOns={styleAddOns}
        compareAtPrice={selectedVariant?.compareAtPrice}
        openCart={() => openDrawer('cart')}
        price={price}
        purchasable={selectedVariantPurchasable}
        quantity={qty}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

class ProductDeferredBoundary extends Component<
  {children: ReactNode; label: string},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: unknown) {
    console.error(`[product] Deferred ${this.props.label} failed:`, error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ProductRecommendations({recommendations}: {recommendations: any[]}) {
  if (!recommendations.length) return null;
  const listings = expandColourVariantListings(recommendations).slice(0, 4);

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-32 sm:px-6 lg:px-12">
      <h3 className="font-display text-4xl md:text-5xl">You may also love</h3>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-14 md:grid-cols-4">
        {listings.map((recommended: any) => (
          <ProductDeferredBoundary
            key={getProductListingKey(recommended)}
            label={`recommended product ${recommended.handle}`}
          >
            <FadeUp>
              <ProductCard product={recommended} />
            </FadeUp>
          </ProductDeferredBoundary>
        ))}
      </div>
    </section>
  );
}

function normalizeRecommendations(
  recommendations: unknown,
): RecommendedProduct[] {
  if (!Array.isArray(recommendations)) return [];

  return recommendations.filter(
    (product): product is RecommendedProduct =>
      Boolean(product) &&
      typeof product === 'object' &&
      typeof (product as {handle?: unknown}).handle === 'string' &&
      typeof (product as {title?: unknown}).title === 'string',
  );
}

function ProductRecommendationsSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1500px] px-4 py-32 sm:px-6 lg:px-12"
      aria-label="Loading product recommendations"
    >
      <div className="h-12 w-64 skeleton-luxury" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-4">
        {Array.from({length: 4}, (_, index) => (
          <div key={index}>
            <div className="aspect-[3/4] skeleton-luxury" />
            <div className="mt-5 h-5 w-3/4 skeleton-luxury" />
            <div className="mt-2 h-3 w-1/2 skeleton-luxury" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MobilePurchaseDock({
  addOns,
  compareAtPrice,
  openCart,
  price,
  purchasable,
  quantity,
  selectedVariant,
}: {
  addOns: Array<{badge?: string; kind: 'plazo' | 'dupatta'; product: any}>;
  compareAtPrice?: any;
  openCart: () => void;
  price?: any;
  purchasable: boolean;
  quantity: number;
  selectedVariant?: any;
}) {
  const visibleAddOns = getVisibleStyleAddOns(addOns).slice(0, 2);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-ivory/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-18px_45px_rgba(28,22,17,0.12)] backdrop-blur md:hidden">
      {visibleAddOns.length > 0 ? (
        <div className="mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleAddOns.map((addOn) => (
            <Link
              className="shrink-0 border border-border bg-cream/70 px-3 py-2 text-[10px] small-caps text-ink/65"
              key={`${addOn.kind}-${addOn.product.handle}`}
              prefetch="intent"
              to={`/products/${addOn.product.handle}`}
            >
              Style with{' '}
              <span className="text-gold">
                {addOn.kind === 'plazo' ? 'plazo' : 'dupatta'}
              </span>
              {addOn.badge ? ' - model wearing' : ''}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(150px,0.9fr)] items-center gap-3">
        <PriceWithSavings
          className="min-w-0 text-sm text-ink"
          compareAtPrice={compareAtPrice}
          price={price}
          size="card"
        />
        <AddToCartButton
          className="block w-full"
          disabled={!purchasable}
          lines={
            selectedVariant && purchasable
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
          onClick={openCart}
        >
          <span className="flex h-11 w-full items-center justify-center bg-ink px-4 text-[11px] small-caps text-ivory transition-colors hover:bg-gold">
            {purchasable ? 'Add to bag' : 'Sold out'}
          </span>
        </AddToCartButton>
      </div>
    </div>
  );
}

function getRequiredMetafield(product: any, key: string) {
  const value = getMetafieldValue(product, key);
  if (!value) {
    logMissingShopifyField(
      `product:${product.handle}`,
      `product metafield custom.${key}`,
      `Create a product metafield custom.${key} in Shopify Admin to fully match the TanStack product UI.`,
    );
  }
  return value;
}

function getUniqueImages(images: any[]) {
  const seen = new Set<string>();

  return images.filter((image) => {
    const key = getImageKey(image);
    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function getFirstUniqueImage(candidates: any[], existingImages: any[]) {
  const existingKeys = new Set(existingImages.map(getImageKey).filter(Boolean));

  return (
    candidates.find((image) => {
      const key = getImageKey(image);
      return key && !existingKeys.has(key);
    }) ?? null
  );
}

function getImageKey(image: any) {
  if (!image?.url) return '';

  return image.id ?? image.url.split('?')[0];
}

function getDefaultVariantIndex(variants: any[]) {
  return Math.max(0, variants.findIndex(isVariantPurchasable));
}

function getVariantIndexFromSearchParams(
  variants: any[],
  searchParams: URLSearchParams,
) {
  const requestedOptions = getVariantOptionNames(variants)
    .map((name) => [name, searchParams.get(name)] as const)
    .filter(
      (entry): entry is readonly [string, string] =>
        Boolean(entry[1]?.trim()),
    );

  if (!requestedOptions.length) return -1;

  const matches = variants
    .map((variant, index) => ({index, variant}))
    .filter(({variant}) =>
      requestedOptions.every(
        ([name, value]) => getOptionValue(variant, name) === value,
      ),
    );

  return (
    matches.find(({variant}) => isVariantPurchasable(variant)) ??
    matches[0] ?? {index: -1}
  ).index;
}

function getSearchParamsForVariant(
  currentSearchParams: URLSearchParams,
  variants: any[],
  variant: any,
) {
  const next = new URLSearchParams(currentSearchParams);

  getVariantOptionNames(variants).forEach((name) => next.delete(name));

  variant.selectedOptions?.forEach(
    (option: {name?: string | null; value?: string | null}) => {
      if (!option.name || !option.value || isDefaultTitleOption(option)) return;
      next.set(option.name, option.value);
    },
  );

  return next;
}

function getVariantOptionNames(variants: any[]) {
  const names: string[] = [];
  const seen = new Set<string>();

  variants.forEach((variant) => {
    variant.selectedOptions?.forEach(
      (option: {name?: string | null; value?: string | null}) => {
        if (!option.name || !option.value || isDefaultTitleOption(option)) {
          return;
        }
        if (seen.has(option.name)) return;

        seen.add(option.name);
        names.push(option.name);
      },
    );
  });

  return names;
}

function isDefaultTitleOption(option: {
  name?: string | null;
  value?: string | null;
}) {
  return (
    option.name?.toLowerCase() === 'title' &&
    option.value?.toLowerCase() === 'default title'
  );
}

function isColorOptionName(name: string) {
  const normalizedName = name.trim().toLowerCase();
  return normalizedName === 'color' || normalizedName === 'colour';
}

function buildConnectedColourOptions(product: any): ProductColourLink[] {
  const referencedProducts = [
    ...getMetafieldProductReferences(product, 'connected_colour_products'),
    ...getMetafieldProductReferences(product, 'connected_color_products'),
  ];

  if (!referencedProducts.length) return [];

  const linkedProducts = referencedProducts.some(
    (linkedProduct) => linkedProduct?.handle === product.handle,
  )
    ? referencedProducts.map((linkedProduct) =>
        linkedProduct?.handle === product.handle ? product : linkedProduct,
      )
    : [product, ...referencedProducts];
  const seen = new Set<string>();

  return linkedProducts
    .map((linkedProduct): ProductColourLink | null => {
      if (!linkedProduct?.handle || !linkedProduct?.title) return null;
      if (seen.has(linkedProduct.handle)) return null;

      seen.add(linkedProduct.handle);

      return {
        current: linkedProduct.handle === product.handle,
        handle: linkedProduct.handle,
        hex: getColourHex(linkedProduct),
        label: getColourLabel(linkedProduct),
        soldOut: isProductSoldOut(linkedProduct),
        title: linkedProduct.title,
      };
    })
    .filter((option): option is ProductColourLink => Boolean(option));
}

function getMetafieldProductReferences(product: any, key: string): any[] {
  const metafield = getCustomMetafield(product, key);
  const references = (metafield?.references?.nodes ?? []) as any[];
  const singleReference = metafield?.reference as any;
  const products: any[] = Array.isArray(references) ? [...references] : [];

  if (singleReference?.handle && singleReference?.title) {
    products.push(singleReference);
  }

  return products.filter((reference) => reference?.handle && reference?.title);
}

function getColourLabel(product: any) {
  return (
    getDisplayMetafieldValue(product, 'display_colour') ||
    getDisplayMetafieldValue(product, 'display_color') ||
    getDisplayMetafieldValue(product, 'colour') ||
    getDisplayMetafieldValue(product, 'color') ||
    inferColourFromTitle(product?.title) ||
    'Colour'
  );
}

function getColourHex(product: any) {
  const value =
    getDisplayMetafieldValue(product, 'colour_hex') ||
    getDisplayMetafieldValue(product, 'color_hex');

  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? value
    : null;
}

function inferColourFromTitle(title?: string | null) {
  const parts = title
    ?.split(/\s[-–—]\s/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts?.length) return '';

  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

function buildProductDescription({
  description,
  fabric,
  product,
  selectedFabric,
  washCare,
}: {
  description?: string | null;
  fabric?: string | null;
  product?: any;
  selectedFabric?: string | null;
  washCare?: string | null;
}) {
  const fabricSummary = selectedFabric || getDisplayMetafieldValue(product, 'fabric') || fabric;
  const fitSummary =
    getDisplayMetafieldValue(product, 'fit') ||
    getDisplayMetafieldValue(product, 'fit_note');
  const careSummary = washCare || getDisplayMetafieldValue(product, 'care');

  return {
    specs: [
      {
        label: 'Embroidery',
        value:
          getDisplayMetafieldValue(product, 'embroidery') ||
          getDisplayMetafieldValue(product, 'work'),
      },
      {label: 'Length', value: getDisplayMetafieldValue(product, 'length')},
      {label: 'Fabric', value: fabricSummary},
      {label: 'Fit', value: fitSummary},
      {label: 'Neckline', value: getDisplayMetafieldValue(product, 'neckline')},
    ].filter((spec) => spec.value),
    notes: [
      {
        title: 'Description',
        body: description,
      },
      {
        title: 'Shade note',
        body: 'Each ilham piece is photographed under controlled studio light. Hand-dyed fabric, embroidery depth, and your screen settings can make the shade appear slightly warmer or cooler in person.',
      },
      {
        title: 'Wash care',
        body: careSummary,
      },
      {
        title: 'Reviews',
        body: (
          <Link
            className="story-link text-gold transition-colors hover:text-ink"
            to="/ilhams-wall"
          >
            Click to see reviews
          </Link>
        ),
      },
    ].filter((section) => section.body),
  };
}

function getDisplayMetafieldValue(product: any, key: string) {
  return formatMetafieldValue(
    getCustomMetafield(product, key)?.value ?? getMetafieldValue(product, key),
  );
}

function buildProductStyleAddOns(product: any): Array<{
  badge?: string;
  kind: 'plazo' | 'dupatta';
  product: any;
}> {
  if (styleAddOnsShouldBeHidden(product)) return [];

  const plazo = getMetafieldProductReference(product, 'style_with_plazo');
  const dupatta = getMetafieldProductReference(product, 'style_with_dupatta');
  const modelWearingPlazo = parseBooleanMetafield(
    getMetafieldValue(product, 'model_wearing_plazo'),
  );
  const addOns: Array<{
    badge?: string;
    kind: 'plazo' | 'dupatta';
    product: any;
  }> = [];
  const seen = new Set<string>();

  if (plazo) {
    addOns.push({
      badge: modelWearingPlazo ? 'Model is wearing this plazo' : undefined,
      kind: 'plazo',
      product: plazo,
    });
  }

  if (dupatta) {
    addOns.push({
      kind: 'dupatta',
      product: dupatta,
    });
  }

  return addOns.filter((addOn) => {
    if (!addOn?.product?.handle || addOn.product.handle === product.handle) {
      return false;
    }
    if (seen.has(addOn.product.handle)) return false;

    seen.add(addOn.product.handle);
    return true;
  });
}

function getVisibleStyleAddOns(
  addOns: Array<{badge?: string; kind: 'plazo' | 'dupatta'; product: any}>,
) {
  return addOns.filter(
    (addOn) => addOn.product?.handle && !isProductSoldOut(addOn.product),
  );
}

function getMetafieldProductReference(product: any, key: string) {
  const metafield = getCustomMetafield(product, key);
  const reference = metafield?.reference;

  return reference?.handle && reference?.title ? reference : null;
}

function getCustomMetafield(product: any, key: string) {
  const mainMetafields = Array.isArray(product?.metafields)
    ? product.metafields
    : product?.metafields?.nodes;
  const colourMetafields = Array.isArray(product?.colourMetafields)
    ? product.colourMetafields
    : product?.colourMetafields?.nodes;
  const metafields = [...(mainMetafields ?? []), ...(colourMetafields ?? [])];

  return metafields?.find(
    (field: any) => field?.key === key && field.namespace === 'custom',
  ) ?? null;
}

function styleAddOnsShouldBeHidden(product: any) {
  if (parseBooleanMetafield(getMetafieldValue(product, 'disable_style_addons'))) {
    return true;
  }

  const text = [
    product?.title,
    product?.handle,
    product?.productType,
    ...(product?.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /\b(2\s*piece|3\s*piece|two\s*piece|three\s*piece|set|suit|co-?ord|outfit|sharara|gharara)\b/.test(
    text,
  );
}

function parseBooleanMetafield(value?: string | null) {
  return /^(true|1|yes)$/i.test(value?.trim() ?? '');
}

function formatMetafieldValue(value?: string | null) {
  if (!value?.trim() || /^gid:\/\//i.test(value.trim())) return '';

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item !== 'string' && typeof item !== 'number') return '';
          return String(item).trim();
        })
        .filter((item) => item && !/^gid:\/\//i.test(item))
        .join(' / ');
    }

    if (typeof parsed === 'string') {
      return /^gid:\/\//i.test(parsed.trim()) ? '' : parsed.trim();
    }

    if (parsed && typeof parsed === 'object') {
      return '';
    }
  } catch {
    // Plain text metafields are expected for most product details.
  }

  return value.trim();
}

function logProductRequirements(product: any) {
  if (!product.images?.nodes?.length && !product.featuredImage?.url) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.images',
      'Add product images in Shopify Admin so the product gallery can render.',
    );
  }
  if (!product.variants?.nodes?.length) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.variants',
      'Add Shopify product variants so Add to bag can create real Shopify cart lines.',
    );
  }
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment IlhamProductVariant on ProductVariant {
    id
    title
    availableForSale
    currentlyNotInStock
    sku
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      id
      handle
      title
      vendor
      productType
    }
    selectedOptions {
      name
      value
    }
  }
` as const;

const PRODUCT_STYLE_ADDON_FRAGMENT = `#graphql
  fragment IlhamProductStyleAddon on Product {
    id
    title
    handle
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variantsCount {
      count
    }
    variants(first: 20) {
      nodes {
        ...IlhamProductVariant
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(identifiers: [{namespace: "custom", key: "subtitle"}]) {
      key
      namespace
      value
    }
  }
` as const;

const PRODUCT_COLOUR_LINK_FRAGMENT = `#graphql
  fragment IlhamProductColourLink on Product {
    id
    title
    handle
    availableForSale
    colourMetafields: metafields(identifiers: [
      {namespace: "custom", key: "display_colour"},
      {namespace: "custom", key: "display_color"},
      {namespace: "custom", key: "colour"},
      {namespace: "custom", key: "color"},
      {namespace: "custom", key: "colour_hex"},
      {namespace: "custom", key: "color_hex"}
    ]) {
      key
      namespace
      value
      type
    }
  }
` as const;

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment IlhamProductCard on Product {
    id
    title
    handle
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 4) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...IlhamProductVariant
        }
      }
    }
    variantsCount {
      count
    }
    variants(first: 20) {
      nodes {
        ...IlhamProductVariant
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "subtitle"},
      {namespace: "custom", key: "split_colour_listings"},
      {namespace: "custom", key: "base_title"},
      {namespace: "custom", key: "connected_colour_products"},
      {namespace: "custom", key: "connected_color_products"}
    ]) {
      key
      namespace
      value
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      productType
      descriptionHtml
      description
      tags
      seo {
        description
        title
      }
      featuredImage {
        id
        url
        altText
        width
        height
      }
      images(first: 50) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 50) {
        nodes {
          ...IlhamProductVariant
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      metafields(identifiers: [
        {namespace: "custom", key: "subtitle"},
        {namespace: "custom", key: "display_colour"},
        {namespace: "custom", key: "display_color"},
        {namespace: "custom", key: "colour"},
        {namespace: "custom", key: "color"},
        {namespace: "custom", key: "colour_hex"},
        {namespace: "custom", key: "color_hex"},
        {namespace: "custom", key: "connected_colour_products"},
        {namespace: "custom", key: "connected_color_products"},
        {namespace: "custom", key: "split_colour_listings"},
        {namespace: "custom", key: "base_title"},
        {namespace: "custom", key: "fabric"},
        {namespace: "custom", key: "care"},
        {namespace: "custom", key: "craft_hours"},
        {namespace: "custom", key: "artisan"},
        {namespace: "custom", key: "origin"},
        {namespace: "custom", key: "occasions"},
        {namespace: "custom", key: "occasion"},
        {namespace: "custom", key: "dress_occasion"},
        {namespace: "custom", key: "wash_care"},
        {namespace: "custom", key: "reviews"},
        {namespace: "custom", key: "shipping_returns"},
        {namespace: "custom", key: "gifting_note"},
        {namespace: "custom", key: "fabric_detail_image"},
        {namespace: "custom", key: "artisan_image"},
        {namespace: "custom", key: "audience"},
        {namespace: "custom", key: "fit"},
        {namespace: "custom", key: "fit_note"},
        {namespace: "custom", key: "lining"},
        {namespace: "custom", key: "length"},
        {namespace: "custom", key: "neckline"},
        {namespace: "custom", key: "sleeve"},
        {namespace: "custom", key: "silhouette"},
        {namespace: "custom", key: "embroidery"},
        {namespace: "custom", key: "work"},
        {namespace: "custom", key: "closure"},
        {namespace: "custom", key: "size_chart"},
        {namespace: "custom", key: "style_with_plazo"},
        {namespace: "custom", key: "style_with_dupatta"},
        {namespace: "custom", key: "model_wearing_plazo"},
        {namespace: "custom", key: "disable_style_addons"}
      ]) {
        key
        namespace
        value
        type
        reference {
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Product {
            ...IlhamProductStyleAddon
            ...IlhamProductColourLink
          }
        }
        references(first: 16) {
          nodes {
            ... on Product {
              ...IlhamProductColourLink
            }
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_STYLE_ADDON_FRAGMENT}
  ${PRODUCT_COLOUR_LINK_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $country: CountryCode
    $language: LanguageCode
    $productId: ID!
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...IlhamProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATIONS_FALLBACK_QUERY = `#graphql
  query ProductRecommendationsFallback(
    $country: CountryCode
    $first: Int!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...IlhamProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
