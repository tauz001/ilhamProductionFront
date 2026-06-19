import {Link, useLocation} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Heart, Menu, Search, ShoppingBag, User, X} from 'lucide-react';
import {useStore} from '~/lib/commerce/cart-store';
import {RootCartGate} from '~/components/commerce/RootCartGate';
import {easeSilk} from '~/lib/motion/variants';
import {
  getMetafieldValue,
  logMissingShopifyField,
} from '~/lib/commerce/shopify-fields';
import {
  buildCollectionFilterHref,
  type CollectionFilterKey,
} from '~/lib/commerce/collection-filters';
import {
  getProductFabricValue,
  getProductOccasionValues,
  productMatchesAnyText,
  productMatchesMenuCategory,
} from '~/lib/commerce/product-facets';
import {
  prefetchLayoutCommerce,
  useLayoutCommerce,
} from '~/lib/commerce/layout-commerce';

const LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/ilham_logo_wo_bg.png?v=1780461025';

const navLinks = [
  {
    label: 'Women',
    href: '/collections/women',
    category: 'women',
  },
  {label: 'Men', href: '/collections/men', category: 'men'},
  {
    label: 'Wedding',
    href: '/collections/wedding-edit',
    category: 'wedding',
  },
  {label: 'Gifting', href: '/gifting'},
  {label: 'Heritage', href: '/about'},
];

const announcements = [
  {
    text: 'Hand-embroidered in Lucknow - all India shipping',
    href: '/collections',
  },
  {
    text: 'Occasion gifting and bulk offers - contact the atelier',
    href: '/contact',
  },
  {
    text: '14-day return or exchange on eligible pieces',
    href: '/policies/refund-policy',
  },
];

const megaMenuCopy = {
  women: {
    eyebrow: 'Women - Atelier',
    heading: (
      <>
        Airy chikankari for <em className="font-serif italic">every hour</em>.
      </>
    ),
    description:
      'Find soft everyday kurtis, polished occasion pieces, and festive whites without digging through the whole shop.',
    moods: [
      'Daily elegance',
      'Party wear',
      'Festive whites',
      'Ethnic classics',
      'Office grace',
      'Summer cottons',
    ],
    types: ['Anarkali kurtas', 'Short kurtis', 'Kaftan sets', 'Sleeveless kurtis'],
  },
  men: {
    eyebrow: 'Men - Atelier',
    heading: (
      <>
        Quiet tailoring with <em className="font-serif italic">Lucknowi</em>{' '}
        detail.
      </>
    ),
    description:
      'Easy kurta layers, evening-ready embroidery, and breathable cotton pieces for repeated wear.',
    moods: [
      'Everyday chikankari',
      'Festive kurtas',
      'Mehfil evenings',
      'Ivory classics',
      'Summer cottons',
    ],
    types: ['Chikankari kurtas', 'Kurta sets', 'Embroidered shirts', 'Layered jackets'],
  },
  wedding: {
    eyebrow: 'Wedding - Edit',
    heading: (
      <>
        Ceremony pieces with <em className="font-serif italic">heirloom</em>{' '}
        calm.
      </>
    ),
    description:
      'A smaller edit for wedding days, gifting rituals, and intimate celebrations.',
    moods: ['Bride side', 'Groom side', 'Sangeet ready', 'Wedding gifting'],
    types: ['Occasion sets', 'Ivory ensembles', 'Statement dupattas'],
  },
} as const;

type MenuLinkSeed = {
  label: string;
  filter?: CollectionFilterKey;
  value?: string;
  query?: string;
  keywords: string[];
};

const menuMoodSeeds: Record<string, MenuLinkSeed[]> = {
  women: [
    {
      label: 'Daily elegance',
      filter: 'occasions',
      value: 'Daily',
      query: 'daily',
      keywords: ['daily', 'everyday', 'casual'],
    },
    {
      label: 'Party wear',
      filter: 'occasions',
      value: 'Party',
      query: 'party',
      keywords: ['party', 'evening', 'occasion'],
    },
    {
      label: 'Festive',
      filter: 'occasions',
      value: 'Festive',
      query: 'festive',
      keywords: ['festive', 'festival', 'eid', 'diwali'],
    },
    {
      label: 'Ethnic classics',
      query: 'ethnic',
      keywords: ['ethnic', 'classic', 'heritage', 'traditional'],
    },
    {
      label: 'Office grace',
      filter: 'occasions',
      value: 'Office',
      query: 'office',
      keywords: ['office', 'workwear', 'work wear'],
    },
  ],
  men: [
    {
      label: 'Everyday chikankari',
      filter: 'occasions',
      value: 'Daily',
      query: 'daily',
      keywords: ['daily', 'everyday', 'casual'],
    },
    {
      label: 'Festive kurtas',
      filter: 'occasions',
      value: 'Festive',
      query: 'festive',
      keywords: ['festive', 'festival', 'eid', 'diwali'],
    },
    {
      label: 'Mehfil evenings',
      query: 'mehfil',
      keywords: ['mehfil', 'evening', 'party', 'occasion'],
    },
    {
      label: 'Ivory classics',
      query: 'ivory',
      keywords: ['ivory', 'white', 'cream', 'classic'],
    },
  ],
  wedding: [
    {
      label: 'Bride side',
      filter: 'occasions',
      value: 'Wedding',
      query: 'bride',
      keywords: ['bride', 'bridal', 'wedding'],
    },
    {
      label: 'Groom side',
      filter: 'occasions',
      value: 'Wedding',
      query: 'groom',
      keywords: ['groom', 'wedding', 'sherwani', 'kurta'],
    },
    {
      label: 'Sangeet ready',
      filter: 'occasions',
      value: 'Sangeet',
      query: 'sangeet',
      keywords: ['sangeet', 'mehendi', 'ceremony'],
    },
  ],
};

const menuTypeSeeds: Record<string, MenuLinkSeed[]> = {
  women: [
    {label: 'Kurtis', query: 'kurti', keywords: ['kurti', 'kurtis']},
    {label: 'Anarkalis', query: 'anarkali', keywords: ['anarkali']},
    {label: 'Short kurtis', query: 'short kurti', keywords: ['short kurti']},
    {label: 'Kaftans', query: 'kaftan', keywords: ['kaftan']},
    {label: 'Sleeveless edits', query: 'sleeveless', keywords: ['sleeveless', 'spaghetti']},
    {label: 'Sarees', query: 'saree', keywords: ['saree', 'sari']},
  ],
  men: [
    {label: 'Kurtas', query: 'kurta', keywords: ['kurta']},
    {label: 'Pathani', query: 'pathani', keywords: ['pathani']},
    {label: 'Nawabi edits', query: 'nawabi', keywords: ['nawabi']},
    {label: 'Embroidered shirts', query: 'shirt', keywords: ['shirt']},
    {label: 'Layered jackets', query: 'jacket', keywords: ['jacket', 'bandi']},
  ],
  wedding: [
    {label: 'Occasion sets', query: 'occasion', keywords: ['occasion', 'set']},
    {label: 'Ivory ensembles', query: 'ivory', keywords: ['ivory', 'white']},
    {label: 'Statement dupattas', query: 'dupatta', keywords: ['dupatta']},
    {label: 'Lehengas', query: 'lehenga', keywords: ['lehenga']},
  ],
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wishlist = useStore((s) => s.wishlist.length);
  const openDrawer = useStore((s) => s.openDrawer);
  const location = useLocation();

  const cancelMegaClose = () => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  };

  const openMegaMenu = (label: string) => {
    cancelMegaClose();
    prefetchLayoutCommerce();
    setMegaOpen(label);
  };

  const queueMegaClose = () => {
    cancelMegaClose();
    megaCloseTimer.current = setTimeout(() => setMegaOpen(null), 90);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(null);
  }, [location.pathname]);

  useEffect(() => {
    return () => cancelMegaClose();
  }, []);

  useEffect(() => {
    if (!announcementVisible || announcements.length <= 1) return;
    const id = window.setInterval(
      () =>
        setAnnouncementIndex((current) => (current + 1) % announcements.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [announcementVisible]);

  const dismissAnnouncement = () => {
    setAnnouncementVisible(false);
  };

  const activeAnnouncement = announcements[announcementIndex];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'bg-ivory/85 backdrop-blur-md border-b border-border/60' : 'bg-transparent'}`}
      onMouseEnter={cancelMegaClose}
      onMouseLeave={queueMegaClose}
    >
      <AnimatePresence initial={false}>
        {announcementVisible && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: '2.25rem', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.45, ease: easeSilk}}
            className="overflow-hidden border-b border-border/60 bg-ivory/92 text-ink shadow-[0_1px_0_oklch(0.78_0.04_75_/_0.22)] backdrop-blur-md"
          >
            <div className="relative mx-auto flex h-9 max-w-[1500px] items-center justify-center px-11 lg:px-12">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeAnnouncement.text}
                  initial={{y: 10, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  exit={{y: -10, opacity: 0}}
                  transition={{duration: 0.45, ease: easeSilk}}
                  className="max-w-full"
                >
                  <Link
                    to={activeAnnouncement.href}
                    prefetch="intent"
                    className="block max-w-[calc(100vw-5.75rem)] truncate text-center small-caps text-[10px] tracking-[0.24em] text-ink/62 transition-colors hover:text-gold md:max-w-none md:tracking-[0.28em]"
                  >
                    {activeAnnouncement.text}
                  </Link>
                </motion.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={dismissAnnouncement}
                aria-label="Dismiss announcement"
                className="absolute right-3 grid h-6 w-6 place-items-center text-ink/45 transition-colors hover:text-ink lg:right-8"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 lg:h-20 lg:px-12">
        <button
          className="flex h-8 w-8 items-center justify-center text-ink lg:hidden"
          aria-label="Open menu"
          onClick={() => openDrawer('menu')}
        >
          <Menu className="h-5 w-5" strokeWidth={1.2} />
        </button>

        <nav className="hidden flex-1 items-center gap-9 lg:flex">
          {navLinks.slice(0, 3).map((l) => (
            <Link
              key={l.label}
              to={l.href}
              prefetch="intent"
              onMouseEnter={() => openMegaMenu(l.label)}
              onFocus={() => openMegaMenu(l.label)}
              className="small-caps text-ink/80 hover:text-ink transition-colors story-link"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          prefetch="intent"
          className="absolute left-1/2 flex h-16 -translate-x-1/2 items-center justify-center lg:static lg:h-20 lg:translate-x-0"
          aria-label="ilham home"
        >
          <img
            src={LOGO_URL}
            alt="ilham"
            className="h-14 w-auto scale-[1.18] object-contain lg:h-[4.5rem] lg:scale-[1.08]"
            loading="eager"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-5">
          <nav className="hidden items-center gap-9 lg:flex mr-4">
            {navLinks.slice(3).map((l) => (
              <Link
                key={l.label}
                to={l.href}
                prefetch="intent"
                className="small-caps text-ink/80 hover:text-ink transition-colors story-link"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            aria-label="Search"
            onPointerEnter={prefetchLayoutCommerce}
            onFocus={prefetchLayoutCommerce}
            onClick={() => {
              prefetchLayoutCommerce();
              openDrawer('search');
            }}
            className="text-ink/80 hover:text-ink"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.2} />
          </button>
          <Link
            to="/account"
            prefetch="intent"
            aria-label="Account"
            className="text-ink/80 hover:text-ink"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.2} />
          </Link>
          <button
            aria-label="Wishlist"
            onPointerEnter={prefetchLayoutCommerce}
            onFocus={prefetchLayoutCommerce}
            onClick={() => {
              prefetchLayoutCommerce();
              openDrawer('wishlist');
            }}
            className="relative text-ink/80 hover:text-ink"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.2} />
            {wishlist > 0 && (
              <span className="absolute -right-2 -top-1 text-[10px] text-gold">
                {wishlist}
              </span>
            )}
          </button>
          <button
            aria-label="Cart"
            onClick={() => openDrawer('cart')}
            className="relative text-ink/80 hover:text-ink"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.2} />
            <RootCartGate>
              {(cart) =>
                (cart?.totalQuantity ?? 0) > 0 ? (
                  <span className="absolute -right-2 -top-1 text-[10px] text-gold">
                    {cart?.totalQuantity}
                  </span>
                ) : null
              }
            </RootCartGate>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {megaOpen && (
          <motion.div
            initial={{opacity: 0, y: -4, scaleY: 0.985}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4, scaleY: 0.985}}
            transition={{duration: 0.24, ease: easeSilk}}
            onMouseEnter={cancelMegaClose}
            className="absolute left-0 right-0 top-full hidden origin-top border-t border-border/60 bg-ivory/95 shadow-soft backdrop-blur-md will-change-transform lg:block"
          >
            <MegaMenu category={megaOpen} onClose={() => setMegaOpen(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MegaMenu({category, onClose}: {category: string; onClose: () => void}) {
  const {data: layoutCommerce} = useLayoutCommerce(true);
  const collections = layoutCommerce?.collections?.nodes ?? [];
  const products = layoutCommerce?.products?.nodes ?? [];
  const cat = category.toLowerCase() as keyof typeof megaMenuCopy;
  const content = megaMenuCopy[cat] ?? megaMenuCopy.women;
  const list = collections.filter(
    (c) =>
      (getCollectionCategory(c) === cat || (cat === 'wedding' && c.handle === 'wedding-edit')) &&
      c.handle !== cat,
  );
  const collectionLinks = list.slice(0, 4);
  const feature = list.find((c) => c.image?.url) ?? list[0];
  const categoryHref =
    cat === 'wedding' ? '/collections/wedding-edit' : `/collections/${cat}`;
  const categoryHandle = cat === 'wedding' ? 'wedding-edit' : cat;
  const scopedProducts = products.filter((product) =>
    productMatchesMenuCategory(product, cat),
  );
  const menuProducts = scopedProducts;
  const moodLinks = buildMenuSeedLinks(
    menuMoodSeeds[cat] ?? [],
    menuProducts,
    categoryHandle,
  );
  const typeLinks = buildMenuSeedLinks(
    menuTypeSeeds[cat] ?? [],
    menuProducts,
    categoryHandle,
  );
  const fabricLinks = buildFabricLinks(menuProducts, categoryHandle);

  if (layoutCommerce && !collections.length) {
    logMissingShopifyField(
      'navigation',
      'collections',
      'Create Shopify collections and publish them to the Hydrogen sales channel so the navigation mega menu can render.',
    );
  }

  return (
    <motion.div
      key={cat}
      initial={{opacity: 0, y: 5}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.22, ease: easeSilk}}
      className="mx-auto grid max-w-[1500px] grid-cols-12 gap-9 px-12 py-10"
    >
      <div className="col-span-3">
        <p className="small-caps text-ink/50">{content.eyebrow}</p>
        <h3 className="mt-5 font-display text-[34px] leading-tight text-ink">
          {content.heading}
        </h3>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
          {content.description}
        </p>
        <Link
          to={categoryHref}
          prefetch="intent"
          onClick={onClose}
          className="mt-7 inline-flex h-11 items-center border border-ink px-5 small-caps text-[10px] text-ink transition-colors hover:bg-ink hover:text-ivory"
        >
          Shop {category}
        </Link>
      </div>
      <div className="col-span-3 border-l border-border pl-8">
        <p className="small-caps text-ink/45">Shop by mood</p>
        {moodLinks.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {moodLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                prefetch="intent"
                onClick={onClose}
                className="border border-border bg-cream/45 px-3 py-2 text-sm text-ink/70 transition-colors hover:border-gold hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm italic leading-relaxed text-ink/45">
            Add occasion tags or metafields to products and this section will
            fill itself.
          </p>
        )}

        {fabricLinks.length ? (
          <div className="mt-7">
            <p className="small-caps text-ink/40">Fabrics</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fabricLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  prefetch="intent"
                  onClick={onClose}
                  className="border border-border/80 px-3 py-1.5 text-xs text-ink/55 transition-colors hover:border-gold hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="col-span-3 border-l border-border pl-8">
        <p className="small-caps text-ink/45">Silhouettes</p>
        <div className="mt-5 grid gap-3">
          {typeLinks.map((type) => (
            <Link
              key={type.label}
              to={type.href}
              prefetch="intent"
              onClick={onClose}
              className="group flex items-baseline justify-between gap-4 border-b border-border pb-2"
            >
              <span className="font-serif text-xl text-ink transition-colors group-hover:text-gold">
                {type.label}
              </span>
              <span className="text-xs text-ink/35 transition-colors group-hover:text-gold">
                View
              </span>
            </Link>
          ))}
          {!typeLinks.length && (
            <Link
              to={categoryHref}
              prefetch="intent"
              onClick={onClose}
              className="group flex items-baseline justify-between gap-4 border-b border-border pb-2"
            >
              <span className="font-serif text-xl text-ink transition-colors group-hover:text-gold">
                Full edit
              </span>
              <span className="text-xs text-ink/35 transition-colors group-hover:text-gold">
                View
              </span>
            </Link>
          )}
        </div>

        {collectionLinks.length ? (
          <div className="mt-7">
            <p className="small-caps text-ink/40">Collections</p>
            <div className="mt-3 grid gap-2">
              {collectionLinks.map((c) => (
                <Link
                  key={c.handle}
                  to={`/collections/${c.handle}`}
                  prefetch="intent"
                  onClick={onClose}
                  className="text-sm text-ink/55 transition-colors hover:text-gold"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="col-span-3">
        {feature?.image?.url ? (
        <Link
          to={`/collections/${feature.handle}`}
          prefetch="intent"
          onClick={onClose}
          className="group block overflow-hidden"
        >
          <div className="aspect-[5/4] overflow-hidden bg-cream">
            <img
              src={feature.image.url}
              alt={feature.image.altText ?? feature.title}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
              loading="eager"
            />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <span className="font-serif text-xl text-ink">{feature.title}</span>
            <span className="small-caps text-[10px] text-ink/50 transition-colors group-hover:text-gold">
              Discover
            </span>
          </div>
        </Link>
        ) : (
          <div className="flex h-full min-h-[220px] flex-col justify-end border border-border bg-cream/35 p-6">
            <img
              src={LOGO_URL}
              alt="ilham"
              className="h-10 w-fit object-contain"
              loading="lazy"
            />
            <p className="mt-5 font-serif text-3xl italic leading-tight text-ink/75">
              Hand embroidery, edited for the moment you are dressing for.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function buildMenuSeedLinks(
  seeds: MenuLinkSeed[],
  products: any[],
  collectionHandle: string,
) {
  if (!products.length) {
    return seeds.map((seed) => ({
      label: seed.label,
      href:
        seed.filter && seed.value
          ? buildCollectionFilterHref({
              handle: collectionHandle,
              filter: seed.filter,
              value: seed.value,
            })
          : buildCollectionFilterHref({
              handle: collectionHandle,
              q: seed.query ?? seed.label,
            }),
      count: 0,
    }));
  }

  return seeds
    .map((seed) => {
      const matchingProducts = products.filter((product) =>
        productMatchesSeed(product, seed),
      );

      if (!matchingProducts.length) return null;

      const href =
        seed.filter &&
        seed.value &&
        seedHasDirectFilterMatch(seed, matchingProducts)
          ? buildCollectionFilterHref({
              handle: collectionHandle,
              filter: seed.filter,
              value: seed.value,
            })
          : buildCollectionFilterHref({
              handle: collectionHandle,
              q: seed.query ?? seed.label,
            });

      return {label: seed.label, href, count: matchingProducts.length};
    })
    .filter(Boolean) as {label: string; href: string; count: number}[];
}

function seedHasDirectFilterMatch(seed: MenuLinkSeed, products: any[]) {
  if (seed.filter === 'fabrics' && seed.value) {
    return products.some(
      (product) =>
        getProductFabricValue(product).toLowerCase() ===
        seed.value?.toLowerCase(),
    );
  }

  if (seed.filter === 'occasions' && seed.value) {
    return products.some((product) =>
      getProductOccasionValues(product).some(
        (occasion) => occasion.toLowerCase() === seed.value?.toLowerCase(),
      ),
    );
  }

  return false;
}

function buildFabricLinks(products: any[], collectionHandle: string) {
  const counts = new Map<string, number>();

  products.forEach((product) => {
    const fabric = getProductFabricValue(product);
    if (!fabric) return;
    counts.set(fabric, (counts.get(fabric) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([label, count]) => ({
      label,
      count,
      href: buildCollectionFilterHref({
        handle: collectionHandle,
        filter: 'fabrics',
        value: label,
      }),
    }));
}

function productMatchesSeed(product: any, seed: MenuLinkSeed) {
  if (seed.filter === 'fabrics' && seed.value) {
    return getProductFabricValue(product).toLowerCase() === seed.value.toLowerCase();
  }

  if (seed.filter === 'occasions' && seed.value) {
    const occasions = getProductOccasionValues(product).map((value) =>
      value.toLowerCase(),
    );
    if (occasions.includes(seed.value.toLowerCase())) return true;
  }

  return productMatchesAnyText(product, seed.keywords);
}

function getCollectionCategory(collection: any) {
  const category = getMetafieldValue(collection, 'category');
  if (!category) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      'collection metafield custom.category',
      'Create a collection metafield custom.category in Shopify Admin so navigation grouping can match the TanStack mega menu.',
    );
  }
  return category ?? '';
}

function getCollectionTagline(collection: any) {
  const tagline = getMetafieldValue(collection, 'tagline');
  if (!tagline) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      'collection metafield custom.tagline',
      'Create a collection metafield custom.tagline in Shopify Admin so the navigation mega menu can match the TanStack copy.',
    );
  }
  return tagline ?? '';
}

export function MobileMenuDrawer() {
  const drawer = useStore((s) => s.drawer);
  const close = useStore((s) => s.closeDrawer);

  return (
    <AnimatePresence>
      {drawer === 'menu' && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5, ease: easeSilk}}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[81] flex w-[88%] max-w-sm flex-col overflow-hidden bg-ivory p-8"
            initial={{x: '-100%'}}
            animate={{x: 0}}
            exit={{x: '-100%'}}
            transition={{duration: 0.8, ease: easeSilk}}
          >
            <span
              aria-hidden
              className="font-urdu pointer-events-none absolute -right-6 top-24 select-none text-[28vh] leading-none text-gold/[0.07]"
            >
              الہام
            </span>

            <motion.div
              className="relative flex items-center justify-between"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.6, delay: 0.25, ease: easeSilk}}
            >
              <Link to="/" prefetch="intent" onClick={close} aria-label="ilham home">
                <img
                  src={LOGO_URL}
                  alt="ilham"
                  className="h-14 w-auto scale-[1.12] object-contain"
                  loading="eager"
                />
              </Link>
              <button onClick={close} aria-label="Close menu">
                <X className="h-5 w-5" strokeWidth={1.2} />
              </button>
            </motion.div>

            <motion.nav
              className="relative mt-14 flex flex-col gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {staggerChildren: 0.09, delayChildren: 0.35},
                },
              }}
            >
              {[...navLinks, {label: 'Contact', href: '/contact'}].map((l) => (
                <div key={l.label} className="overflow-hidden">
                  <motion.div
                    variants={{
                      hidden: {y: '110%', opacity: 0},
                      visible: {
                        y: '0%',
                        opacity: 1,
                        transition: {duration: 0.9, ease: easeSilk},
                      },
                    }}
                  >
                    <Link
                      to={l.href}
                      prefetch="intent"
                      onClick={close}
                      className="block font-serif text-4xl text-ink hover:text-gold transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </motion.nav>

            <motion.div
              className="relative mt-auto pt-12 border-t border-border"
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8, delay: 0.9, ease: easeSilk}}
            >
              <p className="small-caps text-ink/50">Atelier, Lucknow</p>
              <p className="mt-3 font-serif text-lg italic text-ink/80">
                Every thread carries a story.
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

