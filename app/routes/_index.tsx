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
import {ProductCard} from '~/components/commerce/ProductCard';
import {easeSilk} from '~/lib/motion/variants';
import {logMissingShopifyField, tagIncludes} from '~/lib/commerce/shopify-fields';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'ilham — Lucknowi Chikankari Atelier'},
    {
      name: 'description',
      content:
        'Heirloom Lucknowi chikankari, hand-embroidered over weeks by master artisans. Anarkalis, sarees, kurtas, wedding edit and luxury gifting, shipped worldwide.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(`
    #graphql
    query Homepage {
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
  const {products, collections} = useLoaderData<typeof loader>();

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
    const womenCover = allCollections.find((c: any) => c.handle === 'women')?.image?.url;
    const weddingCover = allCollections.find((c: any) => c.handle === 'wedding-edit')?.image?.url;
    const giftingCover = allCollections.find((c: any) => c.handle === 'luxury-gifting')?.image?.url;
    const p0 = allProducts[0]?.images?.nodes?.[0]?.url
    const p1 = allProducts[1]?.images?.nodes?.[0]?.url
    return [
      {src: p0 ?? womenCover ?? '', alt: 'ilham hero'},
      {src: weddingCover ?? p1 ?? '', alt: 'Wedding edit'},
      {src: womenCover ?? p1 ?? '', alt: "Women's atelier"},
      {src: giftingCover ?? p0 ?? '', alt: 'Luxury gifting'},
    ].filter((s) => Boolean(s.src));
  }, [allProducts, allCollections]);


  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      5500,
    );
    return () => clearInterval(id);
  }, [heroSlides.length]);

  return (
    <>
      <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-ink">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide}
            src={heroSlides[slide]?.src}
            alt={heroSlides[slide]?.alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{opacity: 0, scale: 1.08}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 1.02}}
            transition={{
              opacity: {duration: 1.8, ease: easeSilk},
              scale: {duration: 6.5, ease: 'linear'},
            }}
          />
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
            Lucknow · Est. memory
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
              className="small-caps border border-ivory px-10 py-4 hover:bg-ivory hover:text-ink transition-colors"
            >
              Explore the Collection
            </Link>
            <Link
              to="/gifting"
              className="small-caps text-ivory/90 hover:text-gold transition-colors story-link"
            >
              Gift Worldwide →
            </Link>
          </motion.div>

          <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-28">
            {heroSlides.map((_, i) => (
              <button
                key={i}
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
          {Array.from({length: 2}).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-12 px-6 font-serif text-2xl italic text-ink/70"
            >
              <span>Hand-embroidered in Lucknow</span>
              <ChikanMotif className="h-4 w-16 text-gold" />
              <span>Shipped worldwide</span>
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
          A garment is never <em className="italic font-serif">finished</em> —
          only set down by the hands that made it.
        </h2>
        <FadeUp delay={0.2}>
          <p className="relative mx-auto mt-10 max-w-2xl text-base leading-relaxed text-ink/65">
            ilham translates the old Persian word for <em>imprint</em>. Every
            piece in our atelier is the imprint of a woman in a quiet courtyard,
            a needle in unhurried light, a motif recalled from a grandmother's
            memory.
          </p>
        </FadeUp>
      </section>

      <section className="relative mx-auto max-w-[1500px] px-6 pb-32 lg:px-12 overflow-hidden">
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
            <h2 className="mt-3 font-display text-5xl md:text-6xl">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/collections/new-arrivals"
            className="small-caps story-link hidden md:inline-block"
          >
            View all →
          </Link>
        </div>
        <div className="relative grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3">
          {newArrivals.map((p: any) => (
            <FadeUp key={p.handle}>
              <ProductCard product={p} />
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="grid gap-px bg-border md:grid-cols-2">
        {[
          {
            img: allCollections.find((c: any) => c.handle === 'women')?.image?.url ?? '',
            title: 'Women',
            tagline: 'Anarkalis, sarees, co-ords',
            handle: 'women',
          },
          {
            img: allCollections.find((c: any) => c.handle === 'men')?.image?.url ?? '',
            title: 'Men',
            tagline: 'Kurtas, nawabi, pathani',
            handle: 'men',
          },
        ].map((c) => (
          <Link
            key={c.title}
            to={`/collections/${c.handle}`}
            className="group relative block h-[80vh] overflow-hidden bg-ink"
          >
            <ParallaxImage
              src={c.img}
              alt={c.title}
              className="absolute inset-0"
              imgClassName="brightness-90 group-hover:brightness-100 transition-[filter] duration-[900ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ivory">
              <p className="small-caps text-ivory/70">{c.tagline}</p>
              <h3 className="mt-4 font-display text-7xl tracking-[0.02em] md:text-8xl">
                {c.title}
              </h3>
              <span className="mt-8 small-caps border border-ivory/60 px-8 py-3 group-hover:bg-ivory group-hover:text-ink transition-colors">
                Discover →
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        <ParallaxImage
          src={allCollections.find((c: any) => c.handle === 'wedding-edit')?.image?.url ?? ''}
          alt="The Wedding Edit"
          className="absolute inset-0"
          strength={0.12}
          imgClassName="brightness-[0.78]"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-ivory px-6">
          <p className="small-caps text-ivory/70">The Wedding Edit</p>
          <h2 className="mt-8 font-display text-6xl md:text-8xl">
            Heirlooms before{' '}
            <em className="italic font-serif">they are worn.</em>
          </h2>
          <p className="mt-6 max-w-xl text-ivory/70 leading-relaxed">
            For the bride, the witness, the mother who folds away tomorrow's
            memory tonight.
          </p>
          <Link
            to="/collections/wedding-edit"
            className="mt-12 small-caps border border-ivory px-10 py-4 hover:bg-ivory hover:text-ink transition-colors"
          >
            Enter the edit
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
        <div className="mb-14 flex items-end justify-between border-b border-border pb-6">
          <div>
            <p className="small-caps text-ink/50">Returned to, again and again</p>
            <h2 className="mt-3 font-display text-5xl md:text-6xl">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/collections/best-sellers"
            className="small-caps story-link hidden md:inline-block"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3">
          {bestsellers.map((p: any) => (
            <FadeUp key={p.handle}>
              <ProductCard product={p} />
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
