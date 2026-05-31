import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {useState} from 'react';
import {ChevronDown, Heart, Minus, Plus} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductCard} from '~/components/commerce/ProductCard';
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

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {
      title: product
        ? `${product.title} — ilham`
        : 'Product — ilham',
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

  const recommendationsResult = await storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {productId: product.id},
    })
    .catch((error: Error) => {
      console.error('[product] Shopify productRecommendations query failed:', error);
      return null;
    });

  return {
    product,
    recommendations: recommendationsResult?.productRecommendations ?? [],
  };
}

export default function Product() {
  const {product, recommendations} = useLoaderData<typeof loader>();
  const variants = product.variants?.nodes ?? [];
  const firstAvailableIndex = Math.max(
    0,
    variants.findIndex((variant: any) => variant.availableForSale),
  );
  const [variantIdx, setVariantIdx] = useState(firstAvailableIndex);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('fabric');
  const wishlist = useStore((s) => s.wishlist);
  const toggleW = useStore((s) => s.toggleWishlist);
  const openDrawer = useStore((s) => s.openDrawer);
  const saved = wishlist.includes(product.handle);
  const selectedVariant = variants[variantIdx] ?? variants[firstAvailableIndex];
  const price = selectedVariant?.price ?? product.priceRange?.minVariantPrice;
  const images = product.images?.nodes ?? [];
  const subtitle = getRequiredMetafield(product, 'subtitle');
  const fabric = getRequiredMetafield(product, 'fabric');
  const care = getRequiredMetafield(product, 'care');
  const craftHours = getRequiredMetafield(product, 'craft_hours');
  const artisan = getRequiredMetafield(product, 'artisan');
  const origin = getRequiredMetafield(product, 'origin');
  const shippingReturns = getRequiredMetafield(product, 'shipping_returns');
  const giftingNote = getRequiredMetafield(product, 'gifting_note');
  const fabricDetailImage =
    getMetafieldImage(product, 'fabric_detail_image') ?? images[2] ?? null;
  const artisanImage =
    getMetafieldImage(product, 'artisan_image') ?? images[3] ?? null;
  const occasions = parseListField(getMetafieldValue(product, 'occasions'));

  if (!fabricDetailImage) {
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
      body: [fabric, care].filter(Boolean).join('. '),
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
    <div className="pt-24 md:pt-28">
      <section className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-12 lg:px-12">
        <div className="md:col-span-7 space-y-3">
          {images.map((img: any, i: number) => (
            <div
              key={img.id ?? img.url}
              className="relative aspect-[3/4] overflow-hidden bg-cream cursor-zoom-in"
              onClick={() => i === 0 && setZoom(true)}
            >
              <img
                src={img.url}
                alt={img.altText ?? product.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {fabricDetailImage?.url && (
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
              <img
                src={fabricDetailImage.url}
                alt={fabricDetailImage.altText ?? 'Fabric detail'}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-6 left-6 small-caps text-ivory bg-ink/40 backdrop-blur px-3 py-1">
                Embroidery detail
              </span>
            </div>
          )}
        </div>

        <aside className="md:col-span-5 md:sticky md:top-28 md:self-start md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pl-6">
          <p className="small-caps text-ink/50">{product.productType}</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">
            {product.title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-serif italic text-xl text-ink/60">
              {subtitle}
            </p>
          )}
          {price && (
            <p className="mt-6 text-2xl">
              {formatMoney(price.amount, price.currencyCode)}
            </p>
          )}
          <p className="mt-1 text-xs text-ink/45">
            Inclusive of all taxes · Checkout and shipping calculated by Shopify
          </p>

          {product.description && (
            <p className="mt-8 text-sm leading-relaxed text-ink/70">
              {product.description}
            </p>
          )}

          {occasions.length > 0 && (
            <p className="mt-5 text-xs italic text-ink/50">
              {occasions.join(' · ')}
            </p>
          )}

          {variants.length > 0 && (
            <div className="mt-10">
              <p className="small-caps text-ink/50">Size</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {variants.map((variant: any, i: number) => (
                  <button
                    key={variant.id}
                    onClick={() => variant.availableForSale && setVariantIdx(i)}
                    disabled={!variant.availableForSale}
                    className={`h-12 min-w-12 px-4 border text-sm transition-colors ${
                      i === variantIdx
                        ? 'border-ink bg-ink text-ivory'
                        : variant.availableForSale
                          ? 'border-border hover:border-ink'
                          : 'border-border text-ink/30 line-through cursor-not-allowed'
                    }`}
                  >
                    {getVariantLabel(variant)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border h-12">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3">
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-4 text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <AddToCartButton
              disabled={!selectedVariant?.availableForSale}
              lines={
                selectedVariant
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
            >
              <span className="flex h-12 flex-1 items-center justify-center small-caps bg-ink px-10 text-ivory hover:bg-gold transition-colors">
                {selectedVariant?.availableForSale ? 'Add to bag' : 'Sold out'}
              </span>
            </AddToCartButton>
            <button
              onClick={() => toggleW(product.handle)}
              aria-label="Wishlist"
              className="h-12 w-12 border border-border flex items-center justify-center hover:border-ink"
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.2}
                fill={saved ? 'currentColor' : 'none'}
              />
            </button>
          </div>

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

      {(artisanImage?.url || artisan || craftHours) && (
        <section className="mx-auto mt-32 grid max-w-[1500px] gap-12 px-6 md:grid-cols-2 lg:px-12">
          {artisanImage?.url && (
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={artisanImage.url}
                alt={artisan ? `${artisan}, artisan` : 'Artisan'}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <p className="small-caps text-ink/50">The hands behind {product.title}</p>
            <h2 className="mt-6 font-display text-5xl text-balance">
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

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
          <h3 className="font-display text-4xl md:text-5xl">You may also love</h3>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
            {recommendations.slice(0, 4).map((recommended: any) => (
              <FadeUp key={recommended.handle}>
                <ProductCard product={recommended} />
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {zoom && images[0]?.url && (
          <motion.div
            className="fixed inset-0 z-[90] bg-ink/95 flex items-center justify-center p-6"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setZoom(false)}
          >
            <img
              src={images[0].url}
              alt={images[0].altText ?? ''}
              className="max-h-full max-w-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

function getVariantLabel(variant: any) {
  return (
    variant.selectedOptions?.find(
      (option: {name: string}) => option.name.toLowerCase() === 'size',
    )?.value ?? variant.title
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
        {namespace: "custom", key: "shipping_returns"},
        {namespace: "custom", key: "gifting_note"},
        {namespace: "custom", key: "fabric_detail_image"},
        {namespace: "custom", key: "artisan_image"}
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
