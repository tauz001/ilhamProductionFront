import {Link} from 'react-router';
import {Clock3, MapPin, RefreshCw, Truck} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {ProductRail} from '~/components/commerce/ProductRail';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  CARD_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';

type EditorialImage = {
  altText?: string | null;
  height?: number | null;
  url: string;
  width?: number | null;
};

export type HomepageEditorialProduct = {
  availableForSale?: boolean;
  featuredImage?: EditorialImage | null;
  handle: string;
  id: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  title: string;
  vendor?: string | null;
};

export type HomepageProductCategory = {
  alt: string;
  href: string;
  imageUrl: string;
  title: string;
};

export function NewestAtelierEdit({
  featuredProducts,
  railProducts,
}: {
  featuredProducts: HomepageEditorialProduct[];
  railProducts: any[];
}) {
  const products = featuredProducts
    .filter((product) => Boolean(product.featuredImage?.url))
    .slice(0, 3);

  if (!products.length && !railProducts.length) return null;

  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="border-y border-border/70 bg-cream/45"
    >
      {products.length ? (
        <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.34fr)] lg:items-center lg:gap-12 lg:px-12">
          <div className="order-2 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] lg:order-1 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {products.map((product, index) => (
              <NewestArchCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="order-1 text-center lg:order-2 lg:text-left">
            <p className="small-caps text-gold">New from Lucknow</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.98] text-ink md:text-6xl">
              Fresh from
              <span className="block font-serif italic text-[0.82em]">
                the atelier.
              </span>
            </h2>
            <ChikanMotif className="mx-auto mt-6 h-5 w-32 text-gold lg:mx-0" />
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink/62 lg:mx-0">
              The newest hand-embroidered pieces, chosen as they arrive from
              our Lucknow workrooms.
            </p>
            <Link
              to="/collections/new-arrivals"
              prefetch="intent"
              className="mt-7 inline-flex min-h-12 items-center border border-ink bg-ink px-8 small-caps text-[10px] text-ivory transition-colors hover:border-gold hover:bg-gold"
            >
              Shop the new edit -&gt;
            </Link>
          </div>
        </div>
      ) : null}

      {railProducts.length ? (
        <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-3 sm:px-6 md:pb-16 md:pt-5 lg:px-12">
          <div className="mb-6 flex items-end justify-between gap-6 border-b border-border pb-4">
            <div>
              <p className="small-caps text-ink/45">Continue the new edit</p>
              <h2
                id="new-arrivals-title"
                className="mt-1.5 font-display text-4xl leading-none text-ink md:text-5xl"
              >
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
          <ProductRail products={railProducts} labelledBy="new-arrivals-title" />
        </div>
      ) : null}
    </section>
  );
}

function NewestArchCard({
  index,
  product,
}: {
  index: number;
  product: HomepageEditorialProduct;
}) {
  const image = product.featuredImage;
  if (!image) return null;

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className={`group relative w-[68vw] max-w-[270px] shrink-0 snap-start pt-3 lg:w-auto lg:max-w-none ${
        index === 1 ? 'lg:translate-y-5' : ''
      }`}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-gold/70 bg-cream"
      />
      <div className="rounded-t-[999px] border border-gold/55 bg-ivory p-1.5 shadow-[0_20px_45px_rgba(55,43,27,0.08)]">
        <div className="h-[310px] overflow-hidden rounded-t-[999px] bg-cream sm:h-[350px] lg:h-[370px] xl:h-[410px]">
          <img
            src={shopifyImageUrl(image.url, 640)}
            srcSet={shopifySrcSet(image.url, CARD_IMAGE_WIDTHS)}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 20vw, 68vw"
            alt={image.altText ?? product.title}
            loading="lazy"
            decoding="async"
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            className="h-full w-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
          />
        </div>
        <div className="px-3 pb-4 pt-4 text-center">
          <p className="small-caps line-clamp-1 text-[9px] text-gold">
            {product.vendor || 'ilham chikankari'}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-[2.7rem] font-serif text-lg leading-tight text-ink">
            {product.title}
          </h3>
          <p className="mt-2 text-xs text-ink/60">
            {product.availableForSale
              ? formatMoney(
                  product.priceRange.minVariantPrice.amount,
                  product.priceRange.minVariantPrice.currencyCode,
                )
              : 'Sold out'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function HomepageCategoryStrip({
  categories,
}: {
  categories: HomepageProductCategory[];
}) {
  const visibleCategories = categories
    .filter((category) => category.imageUrl)
    .slice(0, 7);
  if (!visibleCategories.length) return null;

  return (
    <section
      aria-labelledby="homepage-category-title"
      className="border-b border-border/70 bg-ivory py-8 md:py-10"
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12">
        <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
          <div>
            <p className="small-caps text-gold">Shop by form</p>
            <h2
              id="homepage-category-title"
              className="mt-1.5 font-display text-4xl leading-none text-ink md:text-5xl"
            >
              Find your silhouette
            </h2>
          </div>
          <Link
            to="/collections"
            prefetch="intent"
            className="small-caps story-link hidden shrink-0 sm:inline-block"
          >
            Explore all -&gt;
          </Link>
        </div>

        <div className="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-7 lg:justify-center lg:gap-9 [&::-webkit-scrollbar]:hidden">
          {visibleCategories.map((category) => (
            <Link
              key={`${category.href}-${category.title}`}
              to={category.href}
              prefetch="intent"
              className="group w-[106px] shrink-0 snap-start text-center sm:w-[132px] lg:w-[150px]"
            >
              <span className="relative block aspect-square rounded-full border border-gold/55 bg-cream p-1.5 shadow-[0_14px_34px_rgba(55,43,27,0.08)] transition-transform duration-500 group-hover:-translate-y-1">
                <span className="block h-full overflow-hidden rounded-full border border-ivory bg-cream">
                  <img
                    src={shopifyImageUrl(category.imageUrl, 320)}
                    srcSet={shopifySrcSet(category.imageUrl, CARD_IMAGE_WIDTHS)}
                    sizes="(min-width: 1024px) 150px, (min-width: 640px) 132px, 106px"
                    alt={category.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
                  />
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-gold/55 bg-ivory"
                />
              </span>
              <span className="mt-4 block font-serif text-base leading-tight text-ink sm:text-lg">
                {category.title}
              </span>
              <span className="mt-1.5 block small-caps text-[8px] text-gold opacity-0 transition-opacity group-hover:opacity-100 sm:text-[9px]">
                View edit -&gt;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

type PromiseItem = {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  to: string;
};

const HOMEPAGE_PROMISES: PromiseItem[] = [
  {
    description: 'Created with skilled hands in the city where chikankari began.',
    eyebrow: 'Lucknow made',
    icon: MapPin,
    title: 'Rooted in the craft',
    to: '/about',
  },
  {
    description: 'Many pieces carry forty or more hours of patient needlework.',
    eyebrow: 'Made slowly',
    icon: Clock3,
    title: 'Time is part of the piece',
    to: '/about',
  },
  {
    description: 'Secure, tracked delivery from our atelier to addresses across India.',
    eyebrow: 'Across India',
    icon: Truck,
    title: 'Sent with care',
    to: '/policies/shipping-policy',
  },
  {
    description: 'A 14-day return or exchange window on eligible pieces.',
    eyebrow: 'Considered returns',
    icon: RefreshCw,
    title: 'Room to reconsider',
    to: '/policies/refund-policy',
  },
];

export function HomepagePromiseStrip() {
  return (
    <section aria-labelledby="homepage-promise-title" className="bg-ivory py-10 md:py-14">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12">
        <div className="mb-7 flex items-end justify-between gap-6 md:mb-9">
          <div>
            <p className="small-caps text-gold">What stays with every order</p>
            <h2
              id="homepage-promise-title"
              className="mt-2 font-display text-4xl leading-none text-ink md:text-5xl"
            >
              The ilham promise
            </h2>
          </div>
          <ChikanMotif className="hidden h-5 w-32 text-gold/70 md:block" />
        </div>

        <div className="grid border border-border sm:grid-cols-2 lg:grid-cols-4">
          {HOMEPAGE_PROMISES.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <Link
                key={promise.eyebrow}
                to={promise.to}
                prefetch="intent"
                className={`group p-6 transition-colors hover:bg-cream/55 md:p-7 ${
                  index > 0 ? 'border-t border-border' : ''
                } ${index >= 2 ? 'sm:border-t' : 'sm:border-t-0'} ${
                  index % 2 ? 'sm:border-l' : 'sm:border-l-0'
                } ${index > 0 ? 'lg:border-l' : 'lg:border-l-0'} lg:border-t-0`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/45 text-gold transition-colors group-hover:bg-gold group-hover:text-ivory">
                  <Icon className="h-4 w-4" strokeWidth={1.25} />
                </span>
                <p className="mt-5 small-caps text-[9px] text-gold">
                  {promise.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-xl leading-tight text-ink">
                  {promise.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">
                  {promise.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
