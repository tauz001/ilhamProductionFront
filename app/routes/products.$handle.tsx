import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense, useState} from 'react';
import {ChevronDown, Heart, Minus, Plus} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductAssurancePanel} from '~/components/commerce/ProductAssurancePanel';
import {ProductCard} from '~/components/commerce/ProductCard';
import {ProductImageCarousel} from '~/components/commerce/ProductImageCarousel';
import {SizeAndFitGuide} from '~/components/commerce/SizeAndFitGuide';
import {JsonLd} from '~/components/seo/JsonLd';
import {FadeUp} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {useStore} from '~/lib/commerce/cart-store';
import {formatMoney} from '~/lib/commerce/format-money';
import {easeSilk} from '~/lib/motion/variants';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  getMetafieldImage,
  getMetafieldValue,
  logMissingShopifyField,
  parseListField,
} from '~/lib/commerce/shopify-fields';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';
import {
  buildVariantOptionGroups,
  getOptionValue,
} from '~/lib/commerce/selected-variant';
import {getWashCareForFabric} from '~/lib/commerce/product-guidance';
import {
  PDP_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import {breadcrumbJsonLd, canonicalUrl, productJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {
      title: product
        ? `${product.title} - ilham`
        : 'Product - ilham',
    },
    {
      name: 'description',
      content: product?.seo?.description ?? product?.description ?? '',
    },
    {property: 'og:title', content: product?.title ?? 'ilham'},
    {
      property: 'og:image',
      content: product?.featuredImage?.url ?? product?.images?.nodes?.[0]?.url,
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: product ? canonicalUrl(`/products/${product.handle}`) : canonicalUrl('/products'),
    },
  ];
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
    .then((result) => result?.productRecommendations ?? [])
    .catch((error: Error) => {
      console.error('[product] Shopify productRecommendations query failed:', error);
      return [];
    });

  return {
    product,
    recommendations,
  };
}

export default function Product() {
  const {product, recommendations} = useLoaderData<typeof loader>();
  const variants = product.variants?.nodes ?? [];
  const firstAvailableIndex = Math.max(
    0,
    variants.findIndex(isVariantPurchasable),
  );
  const [variantIdx, setVariantIdx] = useState(firstAvailableIndex);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>('fabric');
  const wishlist = useStore((s) => s.wishlist);
  const toggleW = useStore((s) => s.toggleWishlist);
  const openDrawer = useStore((s) => s.openDrawer);
  const saved = wishlist.includes(product.handle);
  const selectedVariant = variants[variantIdx] ?? variants[firstAvailableIndex];
  const selectedVariantPurchasable = isVariantPurchasable(selectedVariant);
  const optionGroups = buildVariantOptionGroups(variants, selectedVariant);
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
  const carouselImages = getUniqueImages([
    ...galleryImages,
    fabricDetailImage,
  ]);
  const artisanImage =
    getMetafieldImage(product, 'artisan_image') ?? galleryImages[3] ?? null;
  const occasions = parseListField(getMetafieldValue(product, 'occasions'));
  const reviewSummary = getMetafieldValue(product, 'reviews');
  const productDetailSections = buildProductDetailSections({
    artisan,
    craftHours,
    description: product.description,
    fabric,
    origin,
    reviewSummary,
    shippingReturns,
    washCare,
  });

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
      body: [fabric, washCare].filter(Boolean).join('. '),
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
    <div className="overflow-x-hidden pt-24 md:pt-28">
      <section className="mx-auto grid max-w-[1500px] gap-8 px-4 sm:px-6 md:grid-cols-12 md:items-start lg:px-12">
        <div className="min-w-0 md:col-span-7">
          <ProductImageCarousel
            images={carouselImages}
            productTitle={product.title}
          />
        </div>

        <aside className="min-w-0 md:col-span-5 md:sticky md:top-24 md:self-start md:pl-8">
          <p className="small-caps text-ink/50">{categoryLabel}</p>
          <h1 className="mt-2 break-words font-display text-4xl leading-none sm:text-5xl md:text-[4rem]">
            {product.title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-serif italic text-xl text-ink/60">
              {subtitle}
            </p>
          )}
          {price && (
            <p className="mt-4 text-2xl">
              {formatMoney(price.amount, price.currencyCode)}
            </p>
          )}
          <p className="mt-1 text-xs text-ink/45">
            Inclusive of all taxes. Checkout and shipping calculated by Shopify
          </p>
          <div className="mt-5 h-px bg-border" />

          {occasions.length > 0 && (
            <p className="mt-5 text-xs italic text-ink/50">
              {occasions.join(' / ')}
            </p>
          )}

          {optionGroups.length > 0 && (
            <div className="mt-6 space-y-4">
              {optionGroups.map((option) => (
                <div key={option.name}>
                  <p className="small-caps text-ink/50">{option.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={`${option.name}-${value.value}`}
                        type="button"
                        onClick={() => {
                          if (value.available && value.variantIndex >= 0) {
                            setVariantIdx(value.variantIndex);
                          }
                        }}
                        disabled={!value.available || value.variantIndex < 0}
                        className={`h-11 min-w-11 px-4 border text-sm transition-colors ${
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

          <SizeAndFitGuide
            product={product}
            selectedSize={getOptionValue(selectedVariant, 'Size')}
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-12 w-full items-center justify-center border border-border sm:w-auto">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 sm:px-3"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-5 text-sm sm:px-4">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((current) => current + 1)}
                className="px-4 sm:px-3"
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
              className="w-full min-w-0 sm:min-w-[220px] sm:flex-1"
            >
              <span className="flex h-12 w-full items-center justify-center bg-ink px-4 small-caps text-ivory transition-colors hover:bg-gold sm:px-8">
                {selectedVariantPurchasable ? 'Add to bag' : 'Sold out'}
              </span>
            </AddToCartButton>
            <button
              type="button"
              onClick={() => toggleW(product.handle)}
              aria-label="Wishlist"
              className="flex h-12 w-full shrink-0 items-center justify-center border border-border hover:border-ink sm:w-12"
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.2}
                fill={saved ? 'currentColor' : 'none'}
              />
            </button>
          </div>

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

      {productDetailSections.length > 0 && (
        <section className="mx-auto mt-24 max-w-[1500px] border-t border-border px-4 pt-16 sm:px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="small-caps text-ink/50">Product notes</p>
              <h2 className="mt-5 break-words font-display text-4xl md:text-6xl">
                Details after the drape.
              </h2>
            </div>
            <div className="divide-y divide-border">
              {productDetailSections.map((section) => (
                <article
                  key={section.title}
                  className="grid gap-5 py-8 md:grid-cols-[160px_minmax(0,1fr)] first:pt-0"
                >
                  <h3 className="small-caps text-ink/50">{section.title}</h3>
                  <p className="text-sm leading-relaxed text-ink/70">
                    {section.body}
                  </p>
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

      <Suspense fallback={<ProductRecommendationsSkeleton />}>
        <Await resolve={recommendations}>
          {(resolvedRecommendations) => (
            <ProductRecommendations recommendations={resolvedRecommendations} />
          )}
        </Await>
      </Suspense>

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
    </div>
  );
}

function ProductRecommendations({recommendations}: {recommendations: any[]}) {
  if (!recommendations.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-32 sm:px-6 lg:px-12">
      <h3 className="font-display text-4xl md:text-5xl">You may also love</h3>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-14 md:grid-cols-4">
        {recommendations.slice(0, 4).map((recommended: any) => (
          <FadeUp key={recommended.handle}>
            <ProductCard product={recommended} />
          </FadeUp>
        ))}
      </div>
    </section>
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

function buildProductDetailSections({
  artisan,
  craftHours,
  description,
  fabric,
  origin,
  reviewSummary,
  shippingReturns,
  washCare,
}: {
  artisan?: string | null;
  craftHours?: string | null;
  description?: string | null;
  fabric?: string | null;
  origin?: string | null;
  reviewSummary?: string | null;
  shippingReturns?: string | null;
  washCare?: string | null;
}) {
  const craftParts = [
    fabric,
    craftHours ? `${craftHours}+ hours of hand embroidery` : '',
    artisan ? `finished by ${artisan}` : '',
    origin,
  ].filter(Boolean);

  return [
    {
      title: 'Description',
      body: description,
    },
    {
      title: 'Craft',
      body: craftParts.join('. '),
    },
    {
      title: 'Wash care',
      body:
        washCare ||
        'Dry clean recommended. Store folded in a breathable cover and avoid direct sunlight on the embroidery.',
    },
    {
      title: 'Reviews',
      body:
        reviewSummary ||
        'Customer reviews for this piece will appear here once shared.',
    },
    {
      title: 'Shipping',
      body: shippingReturns,
    },
  ].filter((section) => section.body);
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

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment IlhamProductCard on Product {
    id
    title
    handle
    vendor
    productType
    tags
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
      images(first: 12) {
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
        {namespace: "custom", key: "fabric"},
        {namespace: "custom", key: "care"},
        {namespace: "custom", key: "craft_hours"},
        {namespace: "custom", key: "artisan"},
        {namespace: "custom", key: "origin"},
        {namespace: "custom", key: "occasions"},
        {namespace: "custom", key: "wash_care"},
        {namespace: "custom", key: "reviews"},
        {namespace: "custom", key: "shipping_returns"},
        {namespace: "custom", key: "gifting_note"},
        {namespace: "custom", key: "fabric_detail_image"},
        {namespace: "custom", key: "artisan_image"},
        {namespace: "custom", key: "audience"},
        {namespace: "custom", key: "fit_note"},
        {namespace: "custom", key: "size_chart"}
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
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
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
