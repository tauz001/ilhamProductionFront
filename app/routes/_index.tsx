//mohammed tauz
import type {Route} from './+types/_index';
import {Link, useLoaderData} from 'react-router';
import {AnimatePresence, motion} from 'framer-motion';
import {ChevronDown} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {MaskedReveal, FadeUp} from '~/components/editorial/MaskedReveal';
import {ParallaxImage} from '~/components/editorial/ParallaxImage';
import {UrduCalligraphy} from '~/components/editorial/UrduCalligraphy';
import {ProductRail} from '~/components/commerce/ProductRail';
import {easeSilk} from '~/lib/motion/variants';
import {
  getMetafieldImage,
  logMissingShopifyField,
  tagIncludes,
} from '~/lib/commerce/shopify-fields';
import {canonicalUrl} from '~/lib/seo';
import {
  HERO_IMAGE_WIDTHS,
  MOBILE_HERO_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'ilham - Lucknowi Chikankari Atelier'},
    {
      name: 'description',
      content:
        'Heirloom Lucknowi chikankari, hand-embroidered over weeks by master artisans. Anarkalis, sarees, kurtas, wedding edit and luxury gifting, shipped across India.',
    },
    {tagName: 'link', rel: 'canonical', href: canonicalUrl('/')},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(`
    #graphql
    query Homepage {
      shop {
        metafields(identifiers: [
          {namespace: "custom", key: "homepage_hero_1"},
          {namespace: "custom", key: "custom_homepage_hero_1"},
          {namespace: "custom", key: "homepage_hero_1_mobile"},
          {namespace: "custom", key: "custom_homepage_hero_1_mobile"},
          {namespace: "custom", key: "homepage_hero_2"},
          {namespace: "custom", key: "custom_homepage_hero_2"},
          {namespace: "custom", key: "homepage_hero_2_mobile"},
          {namespace: "custom", key: "custom_homepage_hero_2_mobile"},
          {namespace: "custom", key: "homepage_hero_3"},
          {namespace: "custom", key: "custom_homepage_hero_3"},
          {namespace: "custom", key: "homepage_hero_3_mobile"},
          {namespace: "custom", key: "custom_homepage_hero_3_mobile"},
          {namespace: "custom", key: "homepage_hero_4"},
          {namespace: "custom", key: "custom_homepage_hero_4"},
          {namespace: "custom", key: "homepage_hero_4_mobile"},
          {namespace: "custom", key: "custom_homepage_hero_4_mobile"},
          {namespace: "custom", key: "homepage_women_banner"},
          {namespace: "custom", key: "custom_homepage_women_banner"},
          {namespace: "custom", key: "homepage_men_banner"},
          {namespace: "custom", key: "custom_homepage_men_banner"},
          {namespace: "custom", key: "homepage_wedding_banner"},
          {namespace: "custom", key: "custom_homepage_wedding_banner"},
          {namespace: "custom", key: "homepage_wdding_banner"},
          {namespace: "custom", key: "custom_homepage_wdding_banner"}
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

      products(first: 12) {
        nodes {
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

          variants(first: 10) {
            nodes {
              id
              title
              availableForSale

              image {
                id
                url
                altText
                width
                height
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

              price {
                amount
                currencyCode
              }
            }
          }

          priceRange {
            minVariantPrice {
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
      }

      collections(first: 10) {
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
  `);

  return data;
}

export default function Home() {
  const {products, collections, shop} = useLoaderData<typeof loader>();

const allProducts = products.nodes;
const allCollections = collections.nodes;

const newArrivals = useMemo(
  () =>
    allProducts.filter(
      (product: any) =>
        tagIncludes(product.tags, 'new-arrival') ||
        tagIncludes(product.tags, 'new'),
    ),
  [allProducts],
);

const bestsellers = useMemo(
  () =>
    allProducts.filter(
      (product: any) =>
        tagIncludes(product.tags, 'best-seller') ||
        tagIncludes(product.tags, 'best-sellers') ||
        tagIncludes(product.tags, 'bestseller'),
    ),
  [allProducts],
);
  const [slide, setSlide] = useState(0);
  const womenCollection = allCollections.find(
    (c: any) => c.handle === 'women',
  );
  const menCollection = allCollections.find((c: any) => c.handle === 'men');
  const weddingCollection = allCollections.find(
    (c: any) => c.handle === 'wedding-edit',
  );
  const womenBannerImage = getMetafieldImage(shop, 'homepage_women_banner');
  const menBannerImage = getMetafieldImage(shop, 'homepage_men_banner');
  const weddingBannerImage =
    getMetafieldImage(shop, 'homepage_wedding_banner') ??
    getMetafieldImage(shop, 'homepage_wdding_banner');
  const womenBanner =
    womenBannerImage?.url ??
    womenCollection?.image?.url ??
    allProducts[0]?.images?.nodes?.[0]?.url ??
    '';
  const menBanner =
    menBannerImage?.url ??
    menCollection?.image?.url ??
    allProducts[1]?.images?.nodes?.[0]?.url ??
    allProducts[0]?.images?.nodes?.[0]?.url ??
    '';
  const weddingBanner =
    weddingBannerImage?.url ??
    weddingCollection?.image?.url ??
    allProducts[1]?.images?.nodes?.[0]?.url ??
    '';

  if (!newArrivals.length) {
    logMissingShopifyField(
      'homepage',
      'product tag new-arrival',
      'Tag products with new-arrival in Shopify Admin to populate the TanStack New Arrivals section.',
    );
  }

  if (!bestsellers.length) {
    logMissingShopifyField(
      'homepage',
      'product tag best-seller',
      'Tag products with best-seller or best-sellers in Shopify Admin to populate the TanStack Best Sellers section.',
    );
  }

  const heroSlides = useMemo(() => {
    const editableSlides = [1, 2, 3, 4]
      .map((position) => {
        const desktop = getMetafieldImage(shop, `homepage_hero_${position}`);
        const mobile = getMetafieldImage(
          shop,
          `homepage_hero_${position}_mobile`,
        );

        return {
          src: desktop?.url ?? mobile?.url ?? '',
          mobileSrc: mobile?.url ?? desktop?.url ?? '',
          alt:
            desktop?.altText ??
            mobile?.altText ??
            `ilham homepage hero ${position}`,
        };
      })
      .filter((image) => Boolean(image.src));

    if (editableSlides.length > 0) {
      return editableSlides;
    }

    const womenCover = allCollections.find((c: any) => c.handle === 'women')?.image?.url;
    const weddingCover = allCollections.find((c: any) => c.handle === 'wedding-edit')?.image?.url;
    const giftingCover = allCollections.find((c: any) => c.handle === 'luxury-gifting')?.image?.url;
    const p0 = allProducts[0]?.images?.nodes?.[0]?.url
    const p1 = allProducts[1]?.images?.nodes?.[0]?.url
    return [
      {src: p0 ?? womenCover ?? '', mobileSrc: p0 ?? womenCover ?? '', alt: 'ilham hero'},
      {src: weddingCover ?? p1 ?? '', mobileSrc: weddingCover ?? p1 ?? '', alt: 'Wedding edit'},
      {src: womenCover ?? p1 ?? '', mobileSrc: womenCover ?? p1 ?? '', alt: "Women's atelier"},
      {src: giftingCover ?? p0 ?? '', mobileSrc: giftingCover ?? p0 ?? '', alt: 'Luxury gifting'},
    ].filter((s) => Boolean(s.src));
  }, [allProducts, allCollections, shop]);


  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      5500,
    );
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const currentHero = heroSlides[slide];
  const currentHeroDesktop = currentHero?.src ?? '';
  const currentHeroMobile = currentHero?.mobileSrc ?? currentHeroDesktop;

  return (
    <>
      <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-ink">
        <AnimatePresence mode="sync">
          <motion.picture
            key={slide}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{opacity: 0, scale: 1.08}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 1.02}}
            transition={{
              opacity: {duration: 1.8, ease: easeSilk},
              scale: {duration: 6.5, ease: 'linear'},
            }}
          >
            <source
              media="(max-width: 767px)"
              srcSet={shopifySrcSet(
                currentHeroMobile,
                MOBILE_HERO_IMAGE_WIDTHS,
              )}
              sizes="100vw"
            />
            <source
              media="(min-width: 768px)"
              srcSet={shopifySrcSet(
                currentHeroDesktop,
                HERO_IMAGE_WIDTHS,
              )}
              sizes="100vw"
            />
            <img
              src={shopifyImageUrl(currentHeroDesktop, 1600)}
              alt={currentHero?.alt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </motion.picture>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/70" />
        <div className="absolute inset-0 vignette" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-24 text-center text-ivory">
          <motion.p
            className="small-caps text-ivory/80"
            initial={{opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1.4, ease: easeSilk, delay: 0.6}}
          >
            Lucknow / Est. memory
          </motion.p>
          <h1 className="mt-6 font-display text-[14vw] leading-[0.92] tracking-[0.02em] text-ivory md:text-[8vw]">
            <span className="block overflow-hidden">
              <MaskedReveal delay={0.7} as="span">
                Every thread
              </MaskedReveal>
            </span>
            <span className="block overflow-hidden italic font-serif">
              <MaskedReveal delay={0.95} as="span">
                carries a story.
              </MaskedReveal>
            </span>
          </h1>
          <motion.div
            className="mt-12 flex flex-col items-center gap-4 md:flex-row md:gap-6"
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1.2, ease: easeSilk, delay: 1.4}}
          >
            <Link
              to="/collections"
              prefetch="intent"
              className="small-caps border border-ivory px-10 py-4 hover:bg-ivory hover:text-ink transition-colors"
            >
              Explore the Collection
            </Link>
            <Link
              to="/gifting"
              prefetch="intent"
              className="small-caps text-ivory/90 hover:text-gold transition-colors story-link"
            >
              Gift across India -&gt;
            </Link>
          </motion.div>

          <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-28">
            {heroSlides.map((heroSlide, i) => (
              <button
                key={heroSlide.src}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-px transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${i === slide ? 'w-10 bg-ivory' : 'w-5 bg-ivory/30'}`}
              />
            ))}
          </div>

          <motion.div
            className="absolute bottom-6 flex flex-col items-center text-ivory/60"
            animate={{y: [0, 8, 0]}}
            transition={{duration: 3, repeat: Infinity, ease: 'easeInOut'}}
          >
            <span className="small-caps text-[10px]">Scroll</span>
            <ChevronDown className="mt-1 h-4 w-4" strokeWidth={1} />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-cream/60 py-6 overflow-hidden">
        <div className="flex whitespace-nowrap marquee">
          {['marquee-a', 'marquee-b'].map((marqueeKey) => (
            <div
              key={marqueeKey}
              className="flex items-center gap-12 px-6 font-serif text-2xl italic text-ink/70"
            >
              <span>Hand-embroidered in Lucknow</span>
              <ChikanMotif className="h-4 w-16 text-gold" />
              <span>Delivered across India</span>
              <ChikanMotif className="h-4 w-16 text-gold" />
              <span>40+ artisan hours per piece</span>
              <ChikanMotif className="h-4 w-16 text-gold" />
              <span>Six generations of whitework</span>
              <ChikanMotif className="h-4 w-16 text-gold" />
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 py-32 text-center md:py-44 overflow-hidden">
        <UrduCalligraphy
          word="حرفہ"
          variant="maroon"
          opacity={0.05}
          size="text-[32vh] md:text-[42vh]"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <FadeUp>
          <p className="relative small-caps text-ink/50">
            A House of Whitework
          </p>
        </FadeUp>
        <h2 className="relative mt-10 font-display text-5xl leading-[1.05] text-ink md:text-7xl text-balance">
          A garment is never <em className="italic font-serif">finished</em> -
          only set down by the hands that made it.
        </h2>
        <FadeUp delay={0.2}>
          <p className="relative mx-auto mt-10 max-w-2xl text-base leading-relaxed text-ink/65">
            ilham translates the old Persian word for <em>imprint</em>. Every
            piece in our atelier is the imprint of a woman in a quiet courtyard,
            a needle in unhurried light, a motif recalled from a grandmother&apos;s
            memory.
          </p>
        </FadeUp>
      </section>

      <section className="relative mx-auto max-w-[1500px] overflow-hidden px-4 pb-28 sm:px-6 lg:px-12">
        <UrduCalligraphy
          word="جدید"
          variant="antique"
          opacity={0.04}
          size="text-[26vh] md:text-[30vh]"
          className="absolute -right-6 top-2 -z-0"
        />
        <div className="relative mb-14 flex items-end justify-between border-b border-border pb-6">
          <div>
            <p className="small-caps text-ink/50">Freshly off the loom</p>
            <h2 id="new-arrivals-title" className="mt-3 font-display text-5xl md:text-6xl">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/collections/new-arrivals"
            prefetch="intent"
            className="small-caps story-link hidden md:inline-block"
          >
            View all -&gt;
          </Link>
        </div>
        <FadeUp>
          <ProductRail products={newArrivals} labelledBy="new-arrivals-title" />
        </FadeUp>
      </section>

      <section className="grid gap-px bg-border md:grid-cols-2">
        {[
          {
            img: womenBanner,
            alt: womenBannerImage?.altText ?? 'Women chikankari banner',
            title: 'Women',
            tagline: 'Anarkalis, sarees, co-ords',
            handle: 'women',
          },
          {
            img: menBanner,
            alt: menBannerImage?.altText ?? 'Men chikankari banner',
            title: 'Men',
            tagline: 'Kurtas, nawabi, pathani',
            handle: 'men',
          },
        ].map((c) => (
          <Link
            key={c.title}
            to={`/collections/${c.handle}`}
            prefetch="intent"
            className="group relative block h-[80vh] overflow-hidden bg-ink"
          >
            <ParallaxImage
              src={c.img}
              alt={c.alt}
              className="absolute inset-0"
              imgClassName="!h-[150%] brightness-90 object-center transition-[filter] duration-[900ms] group-hover:brightness-100 max-md:!h-[170%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ivory">
              <p className="small-caps text-ivory/70">{c.tagline}</p>
              <h3 className="mt-4 font-display text-7xl tracking-[0.02em] md:text-8xl">
                {c.title}
              </h3>
              <span className="mt-8 small-caps border border-ivory/60 px-8 py-3 group-hover:bg-ivory group-hover:text-ink transition-colors">
                Discover -&gt;
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-ink text-ivory md:h-[100svh] md:min-h-[640px]">
        <picture className="absolute inset-0 block h-full w-full">
          <img
            src={shopifyImageUrl(weddingBanner, 1600)}
            srcSet={shopifySrcSet(weddingBanner, HERO_IMAGE_WIDTHS)}
            sizes="100vw"
            alt={weddingBannerImage?.altText ?? 'The Wedding Edit'}
            className="h-full w-full object-cover brightness-[0.86] md:brightness-[0.78]"
            loading="lazy"
            decoding="async"
            width={weddingBannerImage?.width ?? undefined}
            height={weddingBannerImage?.height ?? undefined}
          />
        </picture>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/15 via-ink/20 to-ink/82 md:from-ink/25 md:via-ink/10 md:to-ink/70" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-4xl flex-col items-center justify-end px-6 pb-14 pt-52 text-center md:h-full md:justify-center md:py-0">
          <p className="small-caps text-ivory/70">The Wedding Edit</p>
          <h2 className="mt-6 max-w-3xl font-display text-5xl leading-[0.98] md:mt-8 md:text-8xl">
            Heirlooms before{' '}
            <em className="italic font-serif">they are worn.</em>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/70 md:mt-6 md:text-base">
            For the bride, the witness, the mother who folds away tomorrow&apos;s
            memory tonight.
          </p>
          <Link
            to="/collections/wedding-edit"
            prefetch="intent"
            className="mt-9 inline-flex min-h-12 items-center justify-center border border-ivory px-9 small-caps text-[10px] transition-colors hover:bg-ivory hover:text-ink md:mt-12 md:px-10 md:py-4"
          >
            Shop wedding edit
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-28 sm:px-6 lg:px-12 lg:py-32">
        <div className="mb-14 flex items-end justify-between border-b border-border pb-6">
          <div>
            <p className="small-caps text-ink/50">Returned to, again and again</p>
            <h2 id="best-sellers-title" className="mt-3 font-display text-5xl md:text-6xl">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/collections/best-sellers"
            prefetch="intent"
            className="small-caps story-link hidden md:inline-block"
          >
            View all -&gt;
          </Link>
        </div>
        <FadeUp>
          <ProductRail products={bestsellers} labelledBy="best-sellers-title" />
        </FadeUp>
      </section>
    </>
  );
}
