import {AnimatePresence, motion} from 'framer-motion';
import {Heart, Search as SearchIcon, X} from 'lucide-react';
import {Link, useRouteLoaderData} from 'react-router';
import {useState} from 'react';
import {useStore} from '~/lib/commerce/cart-store';
import {formatMoney} from '~/lib/commerce/format-money';
import {getVisibleCartLines, type RootCart} from '~/lib/commerce/cart-lines';
import {RootCartGate} from '~/components/commerce/RootCartGate';
import {easeSilk} from '~/lib/motion/variants';
import {BagLineItem} from '~/components/commerce/BagLineItem';
import {
  getMetafieldValue,
  logMissingShopifyField,
} from '~/lib/commerce/shopify-fields';

export function Drawers() {
  const drawer = useStore((s) => s.drawer);

  return (
    <>
      <AnimatePresence>
        {(drawer === 'cart' || drawer === 'wishlist') && <Backdrop />}
      </AnimatePresence>
      <CartDrawer />
      <WishlistDrawer />
      <SearchOverlay />
    </>
  );
}

function Backdrop() {
  const close = useStore((s) => s.closeDrawer);
  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-ink/40"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.5, ease: easeSilk}}
      onClick={close}
    />
  );
}

function CartDrawer() {
  const drawer = useStore((s) => s.drawer);
  const close = useStore((s) => s.closeDrawer);

  return (
    <AnimatePresence>
      {drawer === 'cart' && (
        <motion.aside
          className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-md flex-col bg-ivory"
          initial={{x: '100%'}}
          animate={{x: 0}}
          exit={{x: '100%'}}
          transition={{duration: 0.7, ease: easeSilk}}
        >
          <div className="flex items-center justify-between border-b border-border px-8 py-6">
            <div>
              <p className="small-caps text-ink/50">Your atelier</p>
              <h3 className="font-serif text-2xl">The Bag</h3>
            </div>
            <button onClick={close} aria-label="Close cart">
              <X className="h-5 w-5" strokeWidth={1.2} />
            </button>
          </div>

          <RootCartGate>
            {(cart) => (
              <CartDrawerContent cart={cart} onClose={close} />
            )}
          </RootCartGate>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function CartDrawerContent({
  cart,
  onClose,
}: {
  cart: RootCart;
  onClose: () => void;
}) {
  const lines = getVisibleCartLines(cart);
  const subtotalMoney = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="font-serif text-2xl italic text-ink/60">
          Your bag awaits.
        </p>
        <p className="mt-3 text-sm text-ink/50">
          Begin with a quiet piece from our atelier.
        </p>
        <Link
          to="/collections"
          onClick={onClose}
          className="mt-8 small-caps border border-ink px-8 py-3 hover:bg-ink hover:text-ivory transition-colors"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <ul className="space-y-8">
          {lines.map((line) => (
            <BagLineItem
              key={line.id}
              line={line}
              layout="drawer"
              onNavigate={onClose}
            />
          ))}
        </ul>
      </div>
      <div className="border-t border-border px-8 py-6">
        <div className="flex items-baseline justify-between">
          <span className="small-caps text-ink/60">Subtotal</span>
          <span className="font-serif text-2xl">
            {subtotalMoney
              ? formatMoney(
                  String(subtotalMoney.amount),
                  subtotalMoney.currencyCode,
                )
              : '—'}
          </span>
        </div>
        <p className="mt-2 text-xs text-ink/45">
          Shipping & taxes calculated at checkout. Worldwide express included on
          orders over ₹25,000.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/bag"
            onClick={onClose}
            className="border border-ink py-4 small-caps text-center text-ink hover:bg-ink hover:text-ivory transition-colors"
          >
            View Bag
          </Link>
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              onClick={onClose}
              className="bg-ink py-4 small-caps text-center text-ivory hover:bg-gold transition-colors"
            >
              Checkout
            </a>
          ) : (
            <span className="bg-ink/40 py-4 small-caps text-center text-ivory">
              Checkout
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function WishlistDrawer() {
  const drawer = useStore((s) => s.drawer);
  const close = useStore((s) => s.closeDrawer);
  const wishlist = useStore((s) => s.wishlist);
  const toggle = useStore((s) => s.toggleWishlist);
  const products = useLayoutProducts();
  const items = products.filter((p) => wishlist.includes(p.handle));

  if (wishlist.length && items.length !== wishlist.length) {
    console.warn(
      'Missing Shopify field: wishlist products. Some saved product handles were not found in Shopify layout data. Increase the layout products query or move wishlist storage to Shopify customer metafields.',
    );
  }

  return (
    <AnimatePresence>
      {drawer === 'wishlist' && (
        <motion.aside
          className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-md flex-col bg-ivory"
          initial={{x: '100%'}}
          animate={{x: 0}}
          exit={{x: '100%'}}
          transition={{duration: 0.7, ease: easeSilk}}
        >
          <div className="flex items-center justify-between border-b border-border px-8 py-6">
            <div>
              <p className="small-caps text-ink/50">Saved for later</p>
              <h3 className="font-serif text-2xl">Wishlist</h3>
            </div>
            <button onClick={close} aria-label="Close">
              <X className="h-5 w-5" strokeWidth={1.2} />
            </button>
          </div>
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <Heart className="h-8 w-8 text-ink/30" strokeWidth={1} />
              <p className="mt-4 font-serif text-xl italic text-ink/60">
                Nothing saved yet.
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {items.map((p) => (
                <li key={p.handle} className="flex gap-5 px-8 py-6">
                  <Link
                    to={`/products/${p.handle}`}
                    onClick={close}
                    className="aspect-[3/4] w-24 shrink-0 overflow-hidden bg-cream"
                  >
                    {getProductImage(p)?.url && (
                      <img
                        src={getProductImage(p)!.url}
                        alt={getProductImage(p)!.altText ?? p.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <p className="font-serif text-lg">{p.title}</p>
                    <p className="text-xs text-ink/55">
                      {getMetafieldValue(p, 'subtitle')}
                    </p>
                    <p className="mt-2 text-sm">
                      {formatMoney(
                        p.priceRange?.minVariantPrice?.amount ?? '0',
                        p.priceRange?.minVariantPrice?.currencyCode,
                      )}
                    </p>
                    <button
                      onClick={() => toggle(p.handle)}
                      className="mt-auto self-start text-xs text-ink/40 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay() {
  const drawer = useStore((s) => s.drawer);
  const close = useStore((s) => s.closeDrawer);
  const [q, setQ] = useState('');
  const products = useLayoutProducts();
  const collections = useLayoutCollections();

  const matchProducts = products
    .filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        getMetafieldValue(p, 'subtitle')?.toLowerCase().includes(q.toLowerCase()) ||
        p.productType?.toLowerCase().includes(q.toLowerCase()),
    )
    .slice(0, 6);
  const matchCollections = collections
    .filter((c) => !q || c.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 4);

  return (
    <AnimatePresence>
      {drawer === 'search' && (
        <>
          <motion.div
            className="fixed inset-0 z-[81]"
            initial={{opacity: 0, backdropFilter: 'blur(0px)'}}
            animate={{opacity: 1, backdropFilter: 'blur(18px)'}}
            exit={{opacity: 0, backdropFilter: 'blur(0px)'}}
            transition={{duration: 0.9, ease: easeSilk}}
            style={{
              background:
                'radial-gradient(ellipse at top, oklch(0.96 0.012 80 / 0.55), oklch(0.18 0.01 60 / 0.35))',
              WebkitBackdropFilter: 'blur(18px)',
            }}
            onClick={close}
          />

          <motion.div
            className="fixed left-1/2 top-[14vh] z-[82] w-[min(720px,92vw)] -translate-x-1/2"
            initial={{opacity: 0, y: -14, scale: 0.97, filter: 'blur(8px)'}}
            animate={{opacity: 1, y: 0, scale: 1, filter: 'blur(0px)'}}
            exit={{opacity: 0, y: -10, scale: 0.98, filter: 'blur(6px)'}}
            transition={{duration: 0.75, ease: easeSilk}}
          >
            <div
              className="relative overflow-hidden rounded-[2px] border border-ink/10 bg-ivory/70 shadow-fabric"
              style={{
                backdropFilter: 'blur(24px) saturate(1.1)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.1)',
              }}
            >
              <span
                aria-hidden
                className="font-urdu pointer-events-none absolute -top-12 right-6 select-none text-[180px] leading-none text-[oklch(0.32_0.11_25)]/[0.05]"
              >
                تلاش
              </span>

              <div className="relative px-8 pt-7 pb-3">
                <div className="flex items-center justify-between">
                  <p className="small-caps text-ink/45">Search the atelier</p>
                  <button
                    onClick={close}
                    aria-label="Close search"
                    className="text-ink/50 hover:text-ink transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.2} />
                  </button>
                </div>

                <motion.div
                  className="mt-5 flex items-center border-b border-ink/30 pb-3"
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.7, ease: easeSilk, delay: 0.15}}
                >
                  <SearchIcon
                    className="h-4 w-4 text-ink/40"
                    strokeWidth={1.2}
                  />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Anarkali, saree, ivory…"
                    className="ml-3 w-full bg-transparent font-serif text-2xl text-ink placeholder:text-ink/25 focus:outline-none md:text-3xl"
                  />
                </motion.div>
              </div>

              <motion.div
                className="grid gap-10 px-8 pb-8 pt-4 md:grid-cols-2"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {opacity: 0},
                  visible: {
                    opacity: 1,
                    transition: {staggerChildren: 0.06, delayChildren: 0.3},
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: {opacity: 0, y: 10},
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {duration: 0.7, ease: easeSilk},
                    },
                  }}
                >
                  <p className="small-caps text-ink/45">Pieces</p>
                  <ul className="mt-4 space-y-3">
                    {matchProducts.map((p) => (
                      <li key={p.handle}>
                        <Link
                          to={`/products/${p.handle}`}
                          onClick={close}
                          className="group flex items-center gap-3"
                        >
                          {getProductImage(p)?.url && (
                            <img
                              src={getProductImage(p)!.url}
                              alt=""
                              className="h-12 w-10 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-serif text-base group-hover:text-gold transition-colors">
                              {p.title}{' '}
                              <span className="italic text-ink/45">
                                — {getMetafieldValue(p, 'subtitle')}
                              </span>
                            </p>
                            <p className="text-[11px] text-ink/40">
                              {p.productType}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: {opacity: 0, y: 10},
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {duration: 0.7, ease: easeSilk},
                    },
                  }}
                >
                  <p className="small-caps text-ink/45">Collections</p>
                  <ul className="mt-4 space-y-2">
                    {matchCollections.map((c) => (
                      <li key={c.handle}>
                        <Link
                          to={`/collections/${c.handle}`}
                          onClick={close}
                          className="story-link font-serif text-xl"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

function useLayoutProducts() {
  const products = useLayoutCommerce()?.products?.nodes ?? [];
  if (!products.length) {
    logMissingShopifyField(
      'layout',
      'products',
      'Publish Shopify products to the Hydrogen sales channel so search and wishlist drawers can render real product data.',
    );
  }
  return products;
}

function useLayoutCollections() {
  const collections = useLayoutCommerce()?.collections?.nodes ?? [];
  if (!collections.length) {
    logMissingShopifyField(
      'layout',
      'collections',
      'Publish Shopify collections to the Hydrogen sales channel so search drawer collection results can render.',
    );
  }
  return collections;
}

function getProductImage(product: any) {
  return product.images?.nodes?.[0] ?? product.featuredImage ?? null;
}

