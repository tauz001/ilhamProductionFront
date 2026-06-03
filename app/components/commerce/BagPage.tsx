import {Link, useSearchParams} from 'react-router';
import {motion} from 'framer-motion';
import {Gift, RefreshCw, ShieldCheck, Truck} from 'lucide-react';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {UrduCalligraphy} from '~/components/editorial/UrduCalligraphy';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  getDisplayShipping,
  getDisplayTotal,
} from '~/lib/commerce/cart-pricing';
import {
  getCartLineQuantityTotal,
  getVisibleCartLines,
  hasCartLineIssue,
} from '~/lib/commerce/cart-lines';
import {easeSilk} from '~/lib/motion/variants';
import {BagLineItem} from './BagLineItem';
import {DeliveryEstimator} from './DeliveryEstimator';

export type BagRecommendation = {
  id: string;
  handle: string;
  title: string;
  image?: {url: string; altText?: string | null} | null;
  price?: {amount: string; currencyCode: string} | null;
};

type Props = {
  cart: CartApiQueryFragment | null;
  recommendations?: BagRecommendation[];
};

export function BagPage({cart: originalCart, recommendations = []}: Props) {
  const [searchParams] = useSearchParams();
  const cart = useOptimisticCart(originalCart);
  const lines = getVisibleCartLines(cart as CartApiQueryFragment | null);
  const invalidLines = lines.filter(hasCartLineIssue);
  const quantityTotal = getCartLineQuantityTotal(lines);
  const subtotalMoney = cart?.cost?.subtotalAmount;
  const subtotal = subtotalMoney
    ? parseFloat(String(subtotalMoney.amount))
    : 0;
  const currencyCode = subtotalMoney?.currencyCode ?? 'INR';
  const shipping = getDisplayShipping(subtotal, currencyCode);
  const total = getDisplayTotal(subtotal, currencyCode);
  const checkoutUrl = cart?.checkoutUrl;
  const canCheckout =
    Boolean(checkoutUrl) &&
    quantityTotal > 0 &&
    subtotal > 0 &&
    invalidLines.length === 0;
  const checkoutBlocked = searchParams.get('checkout') === 'unavailable';

  return (
    <div className="relative min-h-screen bg-ivory pt-28 pb-24 lg:pt-36">
      <UrduCalligraphy
        word="نقش"
        variant="antique"
        opacity={0.045}
        size="text-[180px] md:text-[260px]"
        className="absolute -top-10 right-4"
      />

      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.9, ease: easeSilk}}
          className="mb-14 flex items-end justify-between border-b border-border pb-8"
        >
          <div>
            <p className="small-caps text-ink/50">Step 01 — Your atelier</p>
            <h1 className="mt-3 font-display text-5xl text-ink lg:text-7xl">
              The Bag
            </h1>
          </div>
          <p className="hidden text-sm italic text-ink/55 md:block">
            {quantityTotal} {quantityTotal === 1 ? 'piece' : 'pieces'} selected
          </p>
        </motion.div>

        {lines.length === 0 ? (
          <EmptyBag />
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
            <ul className="min-w-0 divide-y divide-border">
              {lines.map((line, i) => (
                <BagLineItem
                  key={line.id}
                  line={line}
                  layout="page"
                  index={i}
                />
              ))}
            </ul>

            <aside className="min-w-0 self-start lg:sticky lg:top-28">
              <div className="border border-border bg-cream/50 p-8">
                <p className="small-caps text-ink/50">Order summary</p>
                <h2 className="mt-2 font-serif text-3xl">Carefully tallied</h2>

                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/65">Subtotal</dt>
                    <dd>
                      {subtotalMoney
                        ? formatMoney(
                            String(subtotalMoney.amount),
                            currencyCode,
                          )
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink/65">Shipping</dt>
                    <dd className="text-right italic">{shipping.label}</dd>
                  </div>
                  <div className="flex justify-between text-ink/50">
                    <dt>Estimated taxes</dt>
                    <dd>At checkout</dd>
                  </div>
                </dl>

                <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
                  <span className="small-caps text-ink/60">Estimated total</span>
                  <span className="font-display text-3xl">
                    {formatMoney(total, currencyCode)}
                  </span>
                </div>

                <DeliveryEstimator
                  amount={subtotal}
                  compact
                  className="mt-6 bg-ivory/60"
                />

                {(invalidLines.length > 0 || checkoutBlocked) && (
                  <p className="mt-6 border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    One item in your bag has zero quantity or is no longer
                    purchasable. Increase it back to 1 or remove it before
                    checkout.
                  </p>
                )}

                {canCheckout ? (
                  <Link
                    to="/checkout"
                    className="mt-8 block w-full bg-ink py-4 small-caps text-center text-ivory hover:bg-gold transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <span className="mt-8 block w-full bg-ink/40 py-4 small-caps text-center text-ivory">
                    Resolve Bag Before Checkout
                  </span>
                )}
                <Link
                  to="/collections"
                  className="mt-3 block w-full border border-border py-4 small-caps text-center text-ink/70 hover:text-ink hover:border-ink transition-colors"
                >
                  Continue Exploring
                </Link>

                <ul className="mt-8 space-y-3 text-xs text-ink/60">
                  <li className="flex items-start gap-2">
                    <Gift
                      className="mt-0.5 h-3.5 w-3.5 text-gold"
                      strokeWidth={1.4}
                    />{' '}
                    Complimentary gift wrapping in handloom cloth
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck
                      className="mt-0.5 h-3.5 w-3.5 text-gold"
                      strokeWidth={1.4}
                    />{' '}
                    Delivery rates and timelines confirmed at checkout
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw
                      className="mt-0.5 h-3.5 w-3.5 text-gold"
                      strokeWidth={1.4}
                    />{' '}
                    14-day atelier exchange
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck
                      className="mt-0.5 h-3.5 w-3.5 text-gold"
                      strokeWidth={1.4}
                    />{' '}
                    Secure payment, GoI GI-tagged craft
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="mt-32 border-t border-border pt-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="small-caps text-ink/50">You may also love</p>
                <h2 className="mt-2 font-display text-4xl">Quiet companions</h2>
              </div>
              <Link
                to="/collections"
                className="story-link small-caps text-ink/70"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
              {recommendations.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.handle}`}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-cream">
                    {p.image?.url && (
                      <img
                        src={p.image.url}
                        alt={p.image.altText ?? p.title}
                        className="h-full w-full object-cover hover-silk"
                      />
                    )}
                  </div>
                  <p className="mt-3 font-serif text-base">{p.title}</p>
                  {p.price && (
                    <p className="text-xs text-ink/55">
                      {formatMoney(p.price.amount, p.price.currencyCode)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EmptyBag() {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 1, ease: easeSilk}}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <p className="font-urdu text-7xl text-[oklch(0.32_0.11_25)]/30">خالی</p>
      <h2 className="mt-8 font-display text-5xl text-ink">Your bag awaits</h2>
      <p className="mt-4 max-w-md text-sm italic text-ink/55">
        Every ilham piece is hand-embroidered over weeks. Begin your selection
        from the atelier below.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          to="/collections"
          className="border border-ink bg-ink px-8 py-3 text-center small-caps text-ivory transition-colors hover:border-gold hover:bg-gold"
        >
          Discover the Atelier
        </Link>
        <Link
          to="/gifting"
          className="border border-ink px-8 py-3 text-center small-caps transition-colors hover:bg-ink hover:text-ivory"
        >
          Gifting Hub
        </Link>
      </div>
    </motion.div>
  );
}
