import {redirect} from 'react-router';
import type {Route} from './+types/checkout';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {
  getCartLineQuantityTotal,
  getVisibleCartLines,
  hasCartLineIssue,
} from '~/lib/commerce/cart-lines';

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

  const freshCheckout = await createFreshCheckoutCart(context, cart, lines);
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

  console.log('[checkout] Redirecting to fresh Shopify checkout URL:', {
    oldCartId: cart.id,
    freshCartId: freshCart.id,
    totalQuantity: freshCart.totalQuantity,
  });

  return redirect(getCheckoutRedirectUrl(freshCart.checkoutUrl, context), {
    headers,
  });
}

export default function CheckoutRedirect() {
  return null;
}

function getCheckoutLines(lines: ReturnType<typeof getVisibleCartLines>) {
  return lines.map((line) => ({
    merchandiseId: line.merchandise.id,
    quantity: Math.max(1, Number(line.quantity ?? 1)),
    attributes: line.attributes,
  }));
}

function getApplicableDiscountCodes(
  cart: Awaited<ReturnType<Route.LoaderArgs['context']['cart']['get']>>,
) {
  return (
    cart?.discountCodes
      ?.filter((discountCode) => discountCode.applicable && discountCode.code)
      .map((discountCode) => discountCode.code) ?? []
  );
}

function getCheckoutRedirectUrl(
  checkoutUrl: string,
  context: Route.LoaderArgs['context'],
) {
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN;
  if (!checkoutDomain) return checkoutUrl;

  try {
    const url = new URL(checkoutUrl);
    url.hostname = checkoutDomain;
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

async function createFreshCheckoutCart(
  context: Route.LoaderArgs['context'],
  cart: Awaited<ReturnType<Route.LoaderArgs['context']['cart']['get']>>,
  lines: ReturnType<typeof getVisibleCartLines>,
) {
  const payload = await storefrontCartMutation(context, RAW_CHECKOUT_CART_CREATE, {
    input: {
      lines: getCheckoutLines(lines),
      discountCodes: getApplicableDiscountCodes(cart),
      note: cart?.note ?? undefined,
      attributes: cart?.attributes ?? undefined,
    },
    numCartLines: 250,
  });

  return {
    cart: payload.cartCreate?.cart ?? null,
    errors: payload.cartCreate?.userErrors ?? [],
    warnings: payload.cartCreate?.warnings ?? [],
  };
}

async function storefrontCartMutation(
  context: Route.LoaderArgs['context'],
  query: string,
  variables: Record<string, unknown>,
) {
  const response = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/api/2026-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token':
          context.env.PUBLIC_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  const json = (await response.json()) as {
    data?: Record<string, any>;
    errors?: unknown[];
  };

  if (json.errors?.length) {
    console.error(
      '[checkout] Raw Storefront checkout cart errors:',
      JSON.stringify(json.errors),
    );
  }

  return json.data ?? {};
}

const RAW_CHECKOUT_CART_CREATE = `#graphql
  mutation RawCheckoutCartCreate(
    $input: CartInput!
    $numCartLines: Int = 250
  ) {
    cartCreate(input: $input) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
        target
      }
    }
  }
  ${CART_QUERY_FRAGMENT}
` as const;
