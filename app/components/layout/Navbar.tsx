import {Link, useLocation, useRouteLoaderData} from 'react-router';
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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'bg-ivory/85 backdrop-blur-md border-b border-border/60' : 'bg-transparent'}`}
      onMouseEnter={cancelMegaClose}
      onMouseLeave={queueMegaClose}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 lg:h-20 lg:px-12">
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
          className="font-display text-2xl tracking-[0.18em] text-ink lg:text-[28px]"
          aria-label="ilham — home"
        >
          ilham
        </Link>

        <div className="flex flex-1 items-center justify-end gap-5">
          <nav className="hidden items-center gap-9 lg:flex mr-4">
            {navLinks.slice(3).map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="small-caps text-ink/80 hover:text-ink transition-colors story-link"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            aria-label="Search"
            onClick={() => openDrawer('search')}
            className="text-ink/80 hover:text-ink"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.2} />
          </button>
          <Link
            to="/account"
            aria-label="Account"
            className="text-ink/80 hover:text-ink"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.2} />
          </Link>
          <button
            aria-label="Wishlist"
            onClick={() => openDrawer('wishlist')}
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
  const layoutCommerce = useLayoutCommerce();
  const collections = layoutCommerce?.collections?.nodes ?? [];
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

  if (!collections.length) {
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
          onClick={onClose}
          className="mt-7 inline-flex h-11 items-center border border-ink px-5 small-caps text-[10px] text-ink transition-colors hover:bg-ink hover:text-ivory"
        >
          Shop {category}
        </Link>
      </div>
      <div className="col-span-3 border-l border-border pl-8">
        <p className="small-caps text-ink/45">Shop by mood</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {content.moods.map((keyword) => (
            <Link
              key={keyword}
              to={searchHref(`${category} ${keyword}`)}
              onClick={onClose}
              className="border border-border bg-cream/45 px-3 py-2 text-sm text-ink/70 transition-colors hover:border-gold hover:text-gold"
            >
              {keyword}
            </Link>
          ))}
        </div>
      </div>

      <div className="col-span-3 border-l border-border pl-8">
        <p className="small-caps text-ink/45">Silhouettes</p>
        <div className="mt-5 grid gap-3">
          {content.types.map((type) => (
            <Link
              key={type}
              to={searchHref(`${category} ${type}`)}
              onClick={onClose}
              className="group flex items-baseline justify-between gap-4 border-b border-border pb-2"
            >
              <span className="font-serif text-xl text-ink transition-colors group-hover:text-gold">
                {type}
              </span>
              <span className="text-xs text-ink/35 transition-colors group-hover:text-gold">
                View
              </span>
            </Link>
          ))}
        </div>

        {collectionLinks.length ? (
          <div className="mt-7">
            <p className="small-caps text-ink/40">Collections</p>
            <div className="mt-3 grid gap-2">
              {collectionLinks.map((c) => (
                <Link
                  key={c.handle}
                  to={`/collections/${c.handle}`}
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
            <p className="small-caps text-gold">ilham</p>
            <p className="mt-5 font-serif text-3xl italic leading-tight text-ink/75">
              Hand embroidery, edited for the moment you are dressing for.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function searchHref(term: string) {
  return `/search?q=${encodeURIComponent(term.toLowerCase())}`;
}

function useLayoutCommerce() {
  const data = useRouteLoaderData('root') as
    | {
        layoutCommerce?: {
          collections?: {nodes?: any[]};
          products?: {nodes?: any[]};
        };
      }
    | undefined;

  return data?.layoutCommerce;
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
              نقش
            </span>

            <motion.div
              className="relative flex items-center justify-between"
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.6, delay: 0.25, ease: easeSilk}}
            >
              <span className="font-display text-2xl tracking-[0.18em]">
                ilham
              </span>
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
                "Every thread carries a story."
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

