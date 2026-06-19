import type {Route} from './+types/gifting';
import {useLoaderData} from 'react-router';
import {useMemo, useState} from 'react';
import {Check, Search, ShoppingBag, X} from 'lucide-react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ParallaxImage} from '~/components/editorial/ParallaxImage';
import {FadeUp, MaskedReveal} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  getMetafieldImage,
  getMetafieldValue,
  logMissingShopifyField,
} from '~/lib/commerce/shopify-fields';
import {useStore} from '~/lib/commerce/cart-store';
import {isVariantPurchasable} from '~/lib/commerce/variant-availability';
import {seoMeta} from '~/lib/seo';
import {
  CARD_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: 'Luxury Gifting - ilham',
    description:
      'Gift Lucknowi chikankari across India. Hand-bound boxes, handwritten notes, occasion curation.',
    path: '/gifting',
  });
};

export async function loader({context}: Route.LoaderArgs) {
  const {collections, giftingCollection, products, shop} =
    await context.storefront.query(GIFTING_COLLECTIONS_QUERY);
  const nodes = collections.nodes ?? [];
  const curatedProducts = giftingCollection?.products?.nodes ?? [];
  const fallbackProducts = products?.nodes ?? [];
  const giftProducts = dedupeProducts(
    curatedProducts.length ? curatedProducts : fallbackProducts,
  );

  ['luxury-gifting', 'wedding-edit', 'men', 'women'].forEach((handle) => {
    const collection = nodes.find((item: any) => item.handle === handle);
    if (!collection?.image?.url) {
      logMissingShopifyField(
        `collection:${handle}`,
        'collection.image',
        `Create/publish collection "${handle}" with an image in Shopify Admin so the gifting page can match the TanStack visual layout.`,
      );
    }
  });

  return {collections: nodes, giftProducts, shop};
}

export default function Gifting() {
  const {collections, giftProducts, shop} = useLoaderData<typeof loader>();
  const openDrawer = useStore((s) => s.openDrawer);
  const [occasion, setOccasion] = useState('Wedding');
  const [packaging, setPackaging] = useState('Signature');
  const [note, setNote] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const occasions = useMemo(
    () => [
      'Wedding',
      'Birthday',
      'Anniversary',
      'Festive',
      'Corporate',
      'Just because',
    ],
    [],
  );
  const packagings = useMemo(
    () => [
      {
        name: 'Signature',
        desc: 'Hand-bound ivory box, gold ribbon, dried rose.',
      },
      {
        name: 'Heirloom',
        desc: 'Wooden inlay trunk, muslin wrap, calligraphy seal.',
      },
      {name: 'Atelier', desc: 'Minimalist linen sleeve, hand-stamped wax.'},
    ],
    [],
  );

  const fallbackGiftingHero =
    'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/ChatGPT_Image_May_31_2026_05_58_51_PM.png?v=1780230545';
  const fallbackGiftBox =
    'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/giftboxImg01.png?v=1780518894';
  const giftingHeroImage =
    getMetafieldImage(shop, 'gift_hero') ??
    getMetafieldImage(shop, 'gifting_hero');
  const giftingHeroMobileImage =
    getMetafieldImage(shop, 'gift_hero_mobile') ??
    getMetafieldImage(shop, 'gifting_hero_mobile');
  const giftBoxImage = getMetafieldImage(shop, 'gifting_gift_box');
  const weddingGiftImage = getMetafieldImage(shop, 'wedding_gifting');
  const corporateGiftImage = getMetafieldImage(shop, 'corporate_gifting');
  const herGiftImage = getMetafieldImage(shop, 'for_her_gifting');
  const himGiftImage = getMetafieldImage(shop, 'for_him_gifting');
  const giftingServiceVariantId = getMetafieldValue(
    shop,
    'gifting_service_variant_id',
  )?.trim();
  const giftingHero = giftingHeroImage?.url ?? fallbackGiftingHero;
  const giftBox = giftBoxImage?.url ?? fallbackGiftBox;
  const wedding =
    weddingGiftImage?.url ??
    collections.find((c: any) => c.handle === 'wedding-edit')?.image?.url ??
    giftingHero;
  const men =
    himGiftImage?.url ??
    collections.find((c: any) => c.handle === 'men')?.image?.url ??
    giftingHero;
  const women =
    herGiftImage?.url ??
    collections.find((c: any) => c.handle === 'women')?.image?.url ??
    giftingHero;
  const corporate = corporateGiftImage?.url ?? giftingHero;

  const filteredGiftProducts = useMemo(() => {
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return giftProducts;

    return giftProducts.filter((product: any) =>
      `${product.title} ${product.productType ?? ''} ${product.vendor ?? ''}`
        .toLowerCase()
        .includes(query),
    );
  }, [giftProducts, pickerQuery]);

  const selectedVariant = useMemo(() => {
    const variants = selectedProduct?.variants?.nodes ?? [];
    return (
      variants.find((variant: any) => variant.id === selectedVariantId) ??
      getFirstPurchasableVariant(selectedProduct)
    );
  }, [selectedProduct, selectedVariantId]);
  const selectedVariantPurchasable = isVariantPurchasable(selectedVariant);
  const selectedProductImage = getProductImage(selectedProduct, selectedVariant);
  const selectedProductVariants = selectedProduct?.variants?.nodes ?? [];

  const giftCartLines = useMemo(() => {
    if (
      !selectedProduct ||
      !selectedVariant?.id ||
      !isVariantPurchasable(selectedVariant)
    ) {
      return [];
    }

    const giftAttributes = [
      {key: 'Gift order', value: 'Yes'},
      {key: 'Gift occasion', value: occasion},
      {key: 'Gift packaging', value: packaging},
      {key: 'Gift note', value: note.trim()},
      {key: 'Gift selected from', value: '/gifting'},
    ].filter((attribute) => attribute.value);

    const lines: any[] = [
      {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        selectedVariant,
        attributes: giftAttributes,
      },
    ];

    if (giftingServiceVariantId) {
      lines.push({
        merchandiseId: giftingServiceVariantId,
        quantity: 1,
        attributes: [
          {key: 'Gift service for', value: selectedProduct.title},
          {key: 'Gift occasion', value: occasion},
          {key: 'Gift packaging', value: packaging},
        ],
      });
    }

    return lines;
  }, [
    giftingServiceVariantId,
    note,
    occasion,
    packaging,
    selectedProduct,
    selectedVariant,
  ]);

  const chooseProduct = (product: any) => {
    const variant = getFirstPurchasableVariant(product);
    setSelectedProduct(product);
    setSelectedVariantId(variant?.id ?? null);
    setPickerOpen(false);
  };

  const flows = useMemo(
    () => [
      {
        title: 'Wedding Gifting',
        img: wedding,
        occasion: 'Wedding',
        blurb:
          'For the witness, the maid of honour, the mother. Curated trousseaux from ten pieces upward.',
      },
      {
        title: 'Corporate Gifting',
        img: corporate,
        occasion: 'Corporate',
        blurb:
          'For Diwali, milestones, board appointments. Custom embroidery on the inner placket.',
      },
      {
        title: 'For Her',
        img: women,
        occasion: 'Birthday',
        blurb:
          'Sarees, anarkalis, dupattas - for the women whose presence is already gift enough.',
      },
      {
        title: 'For Him',
        img: men,
        occasion: 'Festive',
        blurb: 'Kurtas and pathani sets for the men of restraint and ritual.',
      },
    ],
    [corporate, men, wedding, women],
  );

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        <ParallaxImage
          src={giftingHero}
          mobileSrc={giftingHeroMobileImage?.url ?? giftingHero}
          alt={giftingHeroImage?.altText ?? 'ilham gifting'}
          className="absolute inset-0"
          imgClassName="brightness-[0.78] object-center max-md:object-top"
          loading="eager"
          fetchPriority="high"
          width={giftingHeroImage?.width ?? undefined}
          height={giftingHeroImage?.height ?? undefined}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center text-ivory px-6">
          <p className="small-caps text-ivory/70">Luxury Gifting</p>
          <h1 className="mt-6 font-display text-6xl md:text-[8vw] leading-[0.95]">
            <MaskedReveal>Gift Lucknowi elegance,</MaskedReveal>
            <br />
            <MaskedReveal delay={0.2}>
              <em className="italic font-serif">anywhere in India.</em>
            </MaskedReveal>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="small-caps text-ink/50">A slow ritual of arrival</p>
        <h2 className="mt-8 font-display text-4xl md:text-5xl text-balance">
          Hand-bound boxes. Handwritten notes. The unhurried opening of something made by hand.
        </h2>
        <ChikanMotif className="mx-auto mt-10 h-6 w-40 text-gold" />
      </section>

      <section className="mx-auto max-w-[1500px] grid grid-cols-1 gap-0 px-0 md:grid-cols-2 border-y border-border">
        {flows.map((f, i) => (
          <FadeUp
            key={f.title}
            delay={(i % 2) * 0.1}
            className={`group relative overflow-hidden ${i % 2 === 1 ? 'md:border-l' : ''} ${i >= 2 ? 'border-t' : ''} border-border`}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={shopifyImageUrl(f.img, 960)}
                srcSet={shopifySrcSet(f.img, CARD_IMAGE_WIDTHS)}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={f.title}
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-8 md:p-12">
              <h3 className="font-display text-4xl md:text-5xl">{f.title}</h3>
              <p className="mt-4 text-ink/65 leading-relaxed">{f.blurb}</p>
              <button
                type="button"
                onClick={() => {
                  setOccasion(f.occasion);
                  setPickerOpen(true);
                }}
                className="mt-6 inline-block small-caps story-link"
              >
                Begin curation
              </button>
            </div>
          </FadeUp>
        ))}
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
        <p className="small-caps text-ink/50 text-center">Compose your gift</p>
        <h2 className="mt-6 text-center font-display text-5xl md:text-6xl">
          A small atelier ritual.
        </h2>

        <div className="mt-20 grid gap-16 md:grid-cols-2">
          <ParallaxImage
            src={giftBox}
            alt={giftBoxImage?.altText ?? 'ilham gift packaging'}
            className="aspect-[4/5]"
          />

          <div className="space-y-12">
            <div>
              <p className="small-caps text-ink/50">Gift piece</p>
              {selectedProduct ? (
                <div className="mt-4 border border-border bg-cream/40 p-4">
                  <div className="flex gap-4">
                    <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden bg-cream">
                      {selectedProductImage?.url ? (
                        <img
                          src={shopifyImageUrl(selectedProductImage.url, 320)}
                          alt={selectedProductImage.altText ?? selectedProduct.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-2xl leading-tight">
                        {selectedProduct.title}
                      </p>
                      {selectedVariant?.price && (
                        <p className="mt-2 text-sm text-ink/60">
                          {formatMoney(
                            selectedVariant.price.amount,
                            selectedVariant.price.currencyCode,
                          )}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="mt-4 small-caps text-ink/55 story-link"
                      >
                        Change piece
                      </button>
                    </div>
                  </div>

                  {selectedProductVariants.length > 1 && (
                    <label className="mt-5 block">
                      <span className="small-caps text-ink/45">Variant</span>
                      <select
                        value={selectedVariant?.id ?? ''}
                        onChange={(event) =>
                          setSelectedVariantId(event.currentTarget.value)
                        }
                        className="mt-2 w-full border border-border bg-ivory px-4 py-3 font-serif text-base text-ink focus:border-ink focus:outline-none"
                      >
                        {selectedProductVariants.map((variant: any) => (
                          <option
                            key={variant.id}
                            value={variant.id}
                            disabled={!isVariantPurchasable(variant)}
                          >
                            {formatVariantTitle(variant)}
                            {!isVariantPurchasable(variant) ? ' - sold out' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-4 flex w-full items-center justify-center gap-3 border border-ink px-10 py-5 small-caps transition-colors hover:bg-ink hover:text-ivory"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
                  Choose the piece
                </button>
              )}
            </div>

            <div>
              <p className="small-caps text-ink/50">Occasion</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`px-5 py-2.5 small-caps border transition-colors ${
                      occasion === o
                        ? 'bg-ink text-ivory border-ink'
                        : 'border-border hover:border-ink'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="small-caps text-ink/50">Packaging</p>
              <div className="mt-4 space-y-3">
                {packagings.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPackaging(p.name)}
                    className={`w-full text-left border p-5 transition-colors flex items-start gap-4 ${
                      packaging === p.name
                        ? 'border-ink bg-cream'
                        : 'border-border hover:border-ink'
                    }`}
                  >
                    <span
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                        packaging === p.name
                          ? 'bg-gold border-gold text-ivory'
                          : 'border-ink/30'
                      }`}
                    >
                      {packaging === p.name && <Check className="h-3 w-3" />}
                    </span>
                    <span>
                      <span className="font-serif text-xl block">{p.name}</span>
                      <span className="text-sm text-ink/60">{p.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="small-caps text-ink/50">Handwritten note</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={240}
                rows={4}
                placeholder="A word, a line, a memory. We will write it in iron-gall ink..."
                className="mt-4 w-full bg-cream/60 border border-border p-5 font-serif text-lg italic focus:outline-none focus:border-ink"
              />
              <p className="mt-2 text-xs text-ink/40">
                {note.length} / 240
              </p>
            </div>

            <div>
              <AddToCartButton
                className="flex w-full items-center justify-center gap-3 bg-ink px-10 py-5 small-caps text-ivory transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:bg-ink/35"
                disabled={!selectedVariantPurchasable}
                lines={giftCartLines}
                onClick={() => openDrawer('cart')}
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
                Add gift to bag
              </AddToCartButton>
              <p className="mt-3 text-xs leading-relaxed text-ink/45">
                Gift occasion, packaging, and note will appear with this order
                in Shopify Admin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductPickerModal
        onChoose={chooseProduct}
        onClose={() => setPickerOpen(false)}
        onQueryChange={setPickerQuery}
        open={pickerOpen}
        products={filteredGiftProducts}
        query={pickerQuery}
      />
    </>
  );
}

function ProductPickerModal({
  onChoose,
  onClose,
  onQueryChange,
  open,
  products,
  query,
}: {
  onChoose: (product: any) => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  open: boolean;
  products: any[];
  query: string;
}) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[90] overflow-y-auto bg-ivory px-4 py-5 md:bg-ivory/95 md:px-8 md:py-8 md:backdrop-blur-sm"
      role="dialog"
    >
      <div className="mx-auto max-w-6xl border border-border bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-8">
          <div>
            <p className="small-caps text-ink/45">Select a gift piece</p>
            <h2 className="mt-1 font-display text-3xl md:text-4xl">
              Choose from the atelier.
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close gift picker"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </div>

        <div className="border-b border-border px-5 py-4 md:px-8">
          <label className="flex items-center gap-3 border border-border bg-cream/50 px-4 py-3 focus-within:border-ink">
            <Search className="h-4 w-4 text-ink/45" strokeWidth={1.4} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              placeholder="Search kurti, saree, dupatta, set..."
              className="w-full bg-transparent font-serif text-lg outline-none placeholder:text-ink/35"
            />
          </label>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const variant = getFirstPurchasableVariant(product);
            const image = getProductImage(product, variant);
            const price = variant?.price ?? product.priceRange?.minVariantPrice;
            const disabled = !variant;

            return (
              <button
                type="button"
                key={product.id}
                disabled={disabled}
                onClick={() => onChoose(product)}
                className="group bg-ivory p-4 text-left transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="aspect-[3/4] overflow-hidden bg-cream">
                  {image?.url ? (
                    <img
                      src={shopifyImageUrl(image.url, 480)}
                      srcSet={shopifySrcSet(image.url, CARD_IMAGE_WIDTHS)}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      alt={image.altText ?? product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="pt-4">
                  <p className="small-caps text-ink/40">
                    {product.productType || product.vendor || 'ilham'}
                  </p>
                  <p className="mt-1 font-serif text-2xl leading-tight">
                    {product.title}
                  </p>
                  {price ? (
                    <p className="mt-2 text-sm text-ink/60">
                      {formatMoney(price.amount, price.currencyCode)}
                    </p>
                  ) : null}
                  <p className="mt-4 small-caps text-ink/50">
                    {disabled ? 'Sold out' : 'Select piece'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {!products.length ? (
          <div className="px-8 py-16 text-center">
            <p className="font-serif text-2xl">No matching pieces found.</p>
            <p className="mt-2 text-sm text-ink/50">
              Try a softer search, or add products to the luxury-gifting
              collection in Shopify Admin.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function dedupeProducts(products: any[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function getFirstPurchasableVariant(product: any) {
  return (product?.variants?.nodes ?? []).find(isVariantPurchasable);
}

function getProductImage(product: any, variant?: any) {
  return (
    variant?.image ??
    product?.featuredImage ??
    product?.images?.nodes?.[0] ??
    null
  );
}

function formatVariantTitle(variant: any) {
  const selectedOptions = variant?.selectedOptions ?? [];
  if (!selectedOptions.length || variant?.title === 'Default Title') {
    return 'Default';
  }
  return selectedOptions
    .map((option: any) => option.value)
    .filter(Boolean)
    .join(' / ');
}

const GIFTING_COLLECTIONS_QUERY = `#graphql
  query GiftingCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafields(identifiers: [
        {namespace: "custom", key: "gifting_hero"},
        {namespace: "custom", key: "custom_gifting_hero"},
        {namespace: "custom", key: "gift_hero"},
        {namespace: "custom", key: "custom_gift_hero"},
        {namespace: "custom", key: "gifting_hero_mobile"},
        {namespace: "custom", key: "custom_gifting_hero_mobile"},
        {namespace: "custom", key: "gift_hero_mobile"},
        {namespace: "custom", key: "custom_gift_hero_mobile"},
        {namespace: "custom", key: "gifting_gift_box"},
        {namespace: "custom", key: "custom_gifting_gift_box"},
        {namespace: "custom", key: "for_him_gifting"},
        {namespace: "custom", key: "custom_for_him_gifting"},
        {namespace: "custom", key: "for_her_gifting"},
        {namespace: "custom", key: "custom_for_her_gifting"},
        {namespace: "custom", key: "wedding_gifting"},
        {namespace: "custom", key: "custom_wedding_gifting"},
        {namespace: "custom", key: "corporate_gifting"},
        {namespace: "custom", key: "custom_corporate_gifting"},
        {namespace: "custom", key: "gifting_service_variant_id"},
        {namespace: "custom", key: "custom_gifting_service_variant_id"}
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
    giftingCollection: collection(handle: "luxury-gifting") {
      products(first: 24) {
        nodes {
          ...GiftPickerProduct
        }
      }
    }
    products(first: 24) {
      nodes {
        ...GiftPickerProduct
      }
    }
    collections(first: 30) {
      nodes {
        id
        title
        handle
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

  fragment GiftPickerProduct on Product {
    id
    title
    handle
    vendor
    productType
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 3) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        price {
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
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

