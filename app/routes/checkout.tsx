import {redirect} from 'react-router';
import type {Route} from './+types/checkout';

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();

  if (!cart?.id || !cart.totalQuantity) {
    console.warn(
      'Missing Shopify field: cart.checkoutUrl. Add items to the Shopify cart before entering checkout.',
    );
    return redirect('/cart');
  }

  if (!cart.checkoutUrl) {
    console.error(
      'Missing Shopify field: cart.checkoutUrl. Check Shopify checkout domain configuration and Storefront API cart permissions in Shopify Admin.',
    );
    return redirect('/cart');
  }

  console.log('[checkout] Redirecting to Shopify checkout URL:', {
    cartId: cart.id,
    totalQuantity: cart.totalQuantity,
  });

  return redirect(cart.checkoutUrl);
}

export default function CheckoutRedirect() {
  return null;
}
