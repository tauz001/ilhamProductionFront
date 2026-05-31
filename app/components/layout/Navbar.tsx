import {Link, useLocation, useRouteLoaderData} from 'react-router';
import {useEffect, useState} from 'react';
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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const wishlist = useStore((s) => s.wishlist.length);
  const openDrawer = useStore((s) => s.openDrawer);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(null);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'bg-ivory/85 backdrop-blur-md border-b border-border/60' : 'bg-transparent'}`}
      onMouseLeave={() => setMegaOpen(null)}
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
              onMouseEnter={() => setMegaOpen(l.label)}
              onFocus={() => setMegaOpen(l.label)}
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
            to="/login"
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

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.5, ease: easeSilk}}
            className="absolute left-0 right-0 top-full hidden border-t border-border/60 bg-ivory/95 backdrop-blur-md lg:block"
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
  const cat = category.toLowerCase();
  const list = collections.filter(
    (c) =>
      (getCollectionCategory(c) === cat || (cat === 'wedding' && c.handle === 'wedding-edit')) &&
      c.handle !== cat,
  );
  const feature = list[0];

  if (!collections.length) {
    logMissingShopifyField(
      'navigation',
      'collections',
      'Create Shopify collections and publish them to the Hydrogen sales channel so the navigation mega menu can render.',
    );
  }

  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-10 px-12 py-12">
      <div className="col-span-3">
        <p className="small-caps text-ink/50">{category} — Atelier</p>
        <h3 className="mt-6 font-display text-3xl text-ink">
          Six centuries of <em className="font-serif italic">whitework</em>,
          slowly translated.
        </h3>
      </div>
      <div className="col-span-5 grid grid-cols-2 gap-x-8 gap-y-4">
        {list.map((c) => (
          <Link
            key={c.handle}
            to={`/collections/${c.handle}`}
            onClick={onClose}
            className="group flex flex-col gap-1"
          >
            <span className="font-serif text-xl text-ink group-hover:text-gold transition-colors">
              {c.title}
            </span>
            <span className="text-xs text-ink/55">{getCollectionTagline(c)}</span>
          </Link>
        ))}
      </div>
      {feature && (
        <Link
          to={`/collections/${feature.handle}`}
          onClick={onClose}
          className="col-span-4 group block overflow-hidden"
        >
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={feature.image.url}
              alt={feature.image.altText}
              className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-serif text-xl text-ink">{feature.title}</span>
            <span className="small-caps text-ink/50">Discover →</span>
          </div>
        </Link>
      )}
    </div>
  );
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

