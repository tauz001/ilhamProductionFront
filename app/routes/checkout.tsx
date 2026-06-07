import {redirect} from 'react-router';
import type {Route} from './+types/checkout';
import {
  getCartLineQuantityTotal,
  getVisibleCartLines,
  hasCartLineIssue,
} from '~/lib/commerce/cart-lines';
import {
  createFreshCheckoutCart,
  getCheckoutRedirectUrl,
} from '~/lib/commerce/storefront-cart';

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();
  const lines = getVisibleCartLines(cart);
  const hasInvalidLines = lines.some(hasCartLineIssue);
  const quantityTotal = getCartLineQuantityTotal(lines);
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);

  if (!cart?.id || !cart.totalQuantity || !quantityTotal) {
    console.warn(
      'Missing Shopify field: cart.checkoutUrl. Add items to the Shopify cart before entering checkout.',
    );
    return redirect('/bag?checkout=unavailable');
  }

  if (hasInvalidLines || subtotal <= 0) {
    console.warn(
      '[checkout] Blocked checkout because the cart contains unavailable or zero-quantity lines.',
    );
    return redirect('/bag?checkout=unavailable');
  }

  if (!cart.checkoutUrl) {
    console.error(
      'Missing Shopify field: cart.checkoutUrl. Check Shopify checkout domain configuration and Storefront API cart permissions in Shopify Admin.',
    );
    return redirect('/bag?checkout=unavailable');
  }

  const freshCheckout = await createFreshCheckoutCart({context, cart, lines});
  const freshCart = freshCheckout.cart;
  const headers = freshCart?.id
    ? context.cart.setCartId(freshCart.id)
    : undefined;

  if (
    freshCheckout.errors?.length ||
    freshCheckout.warnings?.length ||
    !freshCart?.checkoutUrl ||
    !freshCart.totalQuantity
  ) {
    console.warn(
      '[checkout] Shopify rejected the refreshed checkout cart.',
      JSON.stringify({
        errors: freshCheckout.errors,
        warnings: freshCheckout.warnings,
      }),
    );
    return redirect('/bag?checkout=unavailable', {headers});
  }

  return redirect(getCheckoutRedirectUrl(freshCart.checkoutUrl, context), {
    headers,
  });
}

export default function CheckoutRedirect() {
  return null;
}
