import {Suspense, type ReactNode} from 'react';
import {
  Await,
  useAsyncError,
  useAsyncValue,
  useRouteLoaderData,
} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {RootCart} from '~/lib/commerce/cart-lines';

type RootLoaderData = {
  cart?: Promise<CartApiQueryFragment | null>;
};

export function useRootCartPromise(): Promise<CartApiQueryFragment | null> | null {
  const data = useRouteLoaderData('root') as RootLoaderData | undefined;
  return data?.cart ?? null;
}

/** Call only inside `<Await resolve={cart}>`. */
function useOptimisticRootCart() {
  const original = useAsyncValue() as CartApiQueryFragment | null;
  return useOptimisticCart(original);
}

type CartGateProps = {
  fallback?: ReactNode;
  children: (cart: RootCart) => ReactNode;
};

function RootCartResolved({children}: CartGateProps) {
  const cart = useOptimisticRootCart();
  return <>{children(cart as RootCart)}</>;
}

function RootCartError({fallback}: {fallback: ReactNode}) {
  const error = useAsyncError();
  console.error(
    '[cart] Failed to load Shopify cart. Check cart cookie persistence, Storefront API cart permissions, and Shopify Admin product availability.',
    error,
  );
  return <>{fallback}</>;
}

/**
 * Resolves the deferred root cart promise and applies optimistic cart updates.
 */
export function RootCartGate({fallback = null, children}: CartGateProps) {
  const cartPromise = useRootCartPromise();
  if (!cartPromise) return <>{children(null)}</>;

  return (
    <Suspense fallback={fallback}>
      <Await
        resolve={cartPromise}
        errorElement={<RootCartError fallback={fallback} />}
      >
        <RootCartResolved>{children}</RootCartResolved>
      </Await>
    </Suspense>
  );
}
