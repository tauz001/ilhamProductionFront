import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

type StorefrontMutationContext = {
  env: {
    PUBLIC_STORE_DOMAIN?: string;
    PUBLIC_STOREFRONT_API_TOKEN?: string;
    PUBLIC_CHECKOUT_DOMAIN?: string;
  };
};

export function getAddableCartLines(lines: any[] | undefined) {
  return (
    lines
      ?.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: Math.max(1, Number(line.quantity ?? 1)),
        attributes: line.attributes,
        sellingPlanId: line.sellingPlanId,
      }))
      .filter((line) => Boolean(line.merchandiseId)) ?? []
  );
}

export function getAddableCartLinesFromUpdates(
  cart: any,
  updates: any[] | undefined,
) {
  const byLineId = new Map(
    cart?.lines?.nodes?.map((line: any) => [line.id, line]) ?? [],
  );

  return (
    updates
      ?.map((update) => {
        const line = byLineId.get(update.id) as any;
        const merchandiseId = line?.merchandise?.id;

        if (!merchandiseId || Number(update.quantity ?? 0) < 1) return null;

        return {
          merchandiseId,
          quantity: Math.max(1, Number(update.quantity)),
          attributes: line.attributes,
        };
      })
      .filter(Boolean) ?? []
  );
}

export async function addLinesWithoutMarketContext(
  context: StorefrontMutationContext,
  currentCart: any,
  lines: any[],
) {
  if (!lines.length) {
    return {cart: currentCart, errors: [], warnings: []} as CartQueryDataReturn;
  }

  if (!currentCart?.id || cartHasZeroCartLine(currentCart)) {
    return createCartWithoutMarketContext(context, lines);
  }

  const result = await cartLinesAddWithoutMarketContext(
    context,
    currentCart.id,
    lines,
  );

  if (cartHasZeroQuantityLine(result) || cartHasOutOfStockWarning(result)) {
    console.warn(
      '[cart] Existing cart produced zero-quantity lines. Replacing it with a fresh Storefront cart.',
    );
    return createCartWithoutMarketContext(context, lines);
  }

  return result;
}

export async function updateLinesWithoutMarketContext(
  context: StorefrontMutationContext,
  currentCart: any,
  lines: any[],
  repairLines: any[],
) {
  if (!currentCart?.id) {
    return createCartWithoutMarketContext(context, repairLines);
  }

  if (cartHasZeroCartLine(currentCart) && repairLines.length) {
    return createCartWithoutMarketContext(context, repairLines);
  }

  const result = await cartLinesUpdateWithoutMarketContext(
    context,
    currentCart.id,
    lines,
  );

  if (
    repairLines.length &&
    (cartHasZeroQuantityLine(result) || cartHasOutOfStockWarning(result))
  ) {
    return createCartWithoutMarketContext(context, repairLines);
  }

  return result;
}

export async function removeLinesWithoutMarketContext(
  context: StorefrontMutationContext,
  currentCart: any,
  lineIds: string[] | undefined,
) {
  if (!currentCart?.id || !lineIds?.length) {
    return {cart: currentCart, errors: [], warnings: []} as CartQueryDataReturn;
  }

  return cartLinesRemoveWithoutMarketContext(context, currentCart.id, lineIds);
}

export async function createFreshCheckoutCart({
  context,
  cart,
  lines,
}: {
  context: StorefrontMutationContext;
  cart: any;
  lines: any[];
}) {
  const payload = await storefrontCartMutation(context, RAW_CART_CREATE, {
    input: {
      lines: lines.map((line) => ({
        merchandiseId: line.merchandise.id,
        quantity: Math.max(1, Number(line.quantity ?? 1)),
        attributes: line.attributes,
      })),
      discountCodes:
        cart?.discountCodes
          ?.filter((discountCode: any) => discountCode.applicable && discountCode.code)
          .map((discountCode: any) => discountCode.code) ?? [],
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

export function getCheckoutRedirectUrl(
  checkoutUrl: string,
  context: StorefrontMutationContext,
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

function cartHasZeroQuantityLine(result: CartQueryDataReturn) {
  return Boolean(
    result.cart?.lines?.nodes?.some(
      (line: any) => !line.quantity || line.quantity < 1,
    ),
  );
}

function cartHasZeroCartLine(cart: any) {
  return Boolean(
    cart?.lines?.nodes?.some((line: any) => !line.quantity || line.quantity < 1),
  );
}

function cartHasOutOfStockWarning(result: CartQueryDataReturn) {
  return Boolean(
    result.warnings?.some((warning: any) => {
      const code = String(warning?.code ?? '').toUpperCase();
      const message = String(warning?.message ?? '').toLowerCase();
      return code.includes('OUT_OF_STOCK') || message.includes('sold out');
    }),
  );
}

async function createCartWithoutMarketContext(
  context: StorefrontMutationContext,
  lines: any[],
) {
  const payload = await storefrontCartMutation(context, RAW_CART_CREATE, {
    input: {lines},
    numCartLines: 250,
  });

  return toCartResult(payload.cartCreate);
}

async function cartLinesAddWithoutMarketContext(
  context: StorefrontMutationContext,
  cartId: string,
  lines: any[],
) {
  const payload = await storefrontCartMutation(context, RAW_CART_LINES_ADD, {
    cartId,
    lines,
    numCartLines: 250,
  });

  return toCartResult(payload.cartLinesAdd);
}

async function cartLinesUpdateWithoutMarketContext(
  context: StorefrontMutationContext,
  cartId: string,
  lines: any[],
) {
  const payload = await storefrontCartMutation(context, RAW_CART_LINES_UPDATE, {
    cartId,
    lines,
    numCartLines: 250,
  });

  return toCartResult(payload.cartLinesUpdate);
}

async function cartLinesRemoveWithoutMarketContext(
  context: StorefrontMutationContext,
  cartId: string,
  lineIds: string[],
) {
  const payload = await storefrontCartMutation(context, RAW_CART_LINES_REMOVE, {
    cartId,
    lineIds,
    numCartLines: 250,
  });

  return toCartResult(payload.cartLinesRemove);
}

async function storefrontCartMutation(
  context: StorefrontMutationContext,
  query: string,
  variables: Record<string, unknown>,
) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
  const token = context.env.PUBLIC_STOREFRONT_API_TOKEN;

  if (!storeDomain || !token) {
    throw new Error(
      'Missing Shopify Storefront API configuration. Check PUBLIC_STORE_DOMAIN and PUBLIC_STOREFRONT_API_TOKEN.',
    );
  }

  const response = await fetch(
    `https://${storeDomain}/api/2026-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
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
      '[cart] Raw Storefront cart mutation errors:',
      JSON.stringify(json.errors),
    );
  }

  return json.data ?? {};
}

function toCartResult(payload: any) {
  return {
    cart: payload?.cart ?? null,
    errors: payload?.userErrors ?? [],
    warnings: payload?.warnings ?? [],
  } as CartQueryDataReturn;
}

const RAW_CART_CREATE = `#graphql
  mutation RawCartCreate($input: CartInput!, $numCartLines: Int = 250) {
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

const RAW_CART_LINES_ADD = `#graphql
  mutation RawCartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $numCartLines: Int = 250
  ) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
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

const RAW_CART_LINES_UPDATE = `#graphql
  mutation RawCartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $numCartLines: Int = 250
  ) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
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

const RAW_CART_LINES_REMOVE = `#graphql
  mutation RawCartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $numCartLines: Int = 250
  ) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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
