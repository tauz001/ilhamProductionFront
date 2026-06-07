import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {BagPage} from '~/components/commerce/BagPage';
import {
  addLinesWithoutMarketContext,
  getAddableCartLines,
  getAddableCartLinesFromUpdates,
  removeLinesWithoutMarketContext,
  updateLinesWithoutMarketContext,
} from '~/lib/commerce/storefront-cart';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'The Bag - ilham'},
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

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      const lines = getAddableCartLines(inputs.lines);
      const currentCart = await cart.get();
      result = await addLinesWithoutMarketContext(context, currentCart, lines);
      break;
    }
    case CartForm.ACTIONS.LinesUpdate: {
      const currentCart = await cart.get();
      const repairLines = getAddableCartLinesFromUpdates(
        currentCart,
        inputs.lines,
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

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();
  return <BagPage cart={cart} />;
}
