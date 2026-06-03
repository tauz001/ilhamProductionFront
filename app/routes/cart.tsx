import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {BagPage} from '~/components/commerce/BagPage';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'The Bag — ilham'},
    {
      name: 'description',
      content:
        'Review the hand-embroidered pieces in your bag, gift wrapping, and shipping with ilham.',
    },
  ];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;
  console.log(`[cart] action received: ${action}`);

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      const lines = getAddableCartLines(inputs.lines);
      const currentCart = await cart.get();
      console.log('[cart] adding lines:', JSON.stringify(lines));
      result = await addLinesWithoutMarketContext(context, currentCart, lines);
      break;
    }
    case CartForm.ACTIONS.LinesUpdate: {
      const currentCart = await cart.get();
      const repairLines = getAddableCartLinesFromUpdates(
        currentCart,
        inputs.lines,
      );
      console.log(
        '[cart] updating lines:',
        JSON.stringify(
          inputs.lines?.map((line) => ({
            id: line.id,
            quantity: line.quantity,
          })) ?? [],
        ),
      );
      result = await updateLinesWithoutMarketContext(
        context,
        currentCart,
        inputs.lines,
        repairLines,
      );
      break;
    }
    case CartForm.ACTIONS.LinesRemove:
      console.log('[cart] removing lines:', inputs.lineIds ?? []);
      result = await removeLinesWithoutMarketContext(
        context,
        await cart.get(),
        inputs.lineIds,
      );
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  if (errors?.length) {
    console.error('[cart] Shopify cart API errors:', JSON.stringify(errors));
  }
  if (warnings?.length) {
    console.warn('[cart] Shopify cart API warnings:', JSON.stringify(warnings));
  }
  if (!cartResult) {
    console.error(
      '[cart] Shopify cart API returned no cart. Check Storefront API cart permissions and variant availability in Shopify Admin.',
    );
  } else {
    console.log('[cart] Shopify cart persisted:', {
      cartId: cartResult.id,
      totalQuantity: cartResult.totalQuantity,
      lineCount: cartResult.lines?.nodes?.length ?? 0,
      hasCheckoutUrl: Boolean(cartResult.checkoutUrl),
    });
  }

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

function getAddableCartLines(lines: any[] | undefined) {
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

function getAddableCartLinesFromUpdates(cart: any, updates: any[] | undefined) {
  const byLineId = new Map(
    cart?.lines?.nodes?.map((line: any) => [line.id, line]) ?? [],
  );

  return (
    updates
      ?.map((update) => {
        const line = byLineId.get(update.id) as any;
        const merchandiseId = line?.merchandise?.id;

        if (!merchandiseId || Number(update.quantity ?? 0) < 1) {
          return null;
        }

        return {
          merchandiseId,
          quantity: Math.max(1, Number(update.quantity)),
          attributes: line.attributes,
        };
      })
      .filter(Boolean) ?? []
  );
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

async function addLinesWithoutMarketContext(
  context: Route.ActionArgs['context'],
  currentCart: any,
  lines: any[],
) {
  if (!lines.length) {
    return {
      cart: currentCart,
      errors: [],
      warnings: [],
    } as CartQueryDataReturn;
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

async function updateLinesWithoutMarketContext(
  context: Route.ActionArgs['context'],
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

async function removeLinesWithoutMarketContext(
  context: Route.ActionArgs['context'],
  currentCart: any,
  lineIds: string[] | undefined,
) {
  if (!currentCart?.id || !lineIds?.length) {
    return {
      cart: currentCart,
      errors: [],
      warnings: [],
    } as CartQueryDataReturn;
  }

  return cartLinesRemoveWithoutMarketContext(context, currentCart.id, lineIds);
}

async function createCartWithoutMarketContext(
  context: Route.ActionArgs['context'],
  lines: any[],
) {
  const payload = await storefrontCartMutation(context, RAW_CART_CREATE, {
    input: {lines},
    numCartLines: 250,
  });

  return toCartResult(payload.cartCreate);
}

async function cartLinesAddWithoutMarketContext(
  context: Route.ActionArgs['context'],
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
  context: Route.ActionArgs['context'],
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
  context: Route.ActionArgs['context'],
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
  context: Route.ActionArgs['context'],
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

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();
  return <BagPage cart={cart} />;
}
