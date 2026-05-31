import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useEffect} from 'react';

export function AddToCartButton({
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonContent
          analytics={analytics}
          className={className}
          disabled={disabled}
          fetcher={fetcher}
          lines={lines}
          onClick={onClick}
        >
          {children}
        </AddToCartButtonContent>
      )}
    </CartForm>
  );
}

function AddToCartButtonContent({
  analytics,
  children,
  className,
  disabled,
  fetcher,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  fetcher: FetcherWithComponents<any>;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;

    const data = fetcher.data as {
      cart?: {id?: string; totalQuantity?: number} | null;
      errors?: unknown[];
      warnings?: unknown[];
    };

    if (data.errors?.length) {
      console.error('[cart] Add to cart failed:', data.errors);
      return;
    }
    if (data.warnings?.length) {
      console.warn('[cart] Add to cart warnings:', data.warnings);
    }
    if (!data.cart) {
      console.error(
        '[cart] Add to cart returned no Shopify cart. Check product variant availability and Storefront API cart permissions in Shopify Admin.',
      );
      return;
    }

    console.log('[cart] Add to cart confirmed by Shopify:', {
      cartId: data.cart.id,
      totalQuantity: data.cart.totalQuantity,
    });
  }, [fetcher.data, fetcher.state]);

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <button
        type="submit"
        onClick={() => {
          if (!lines.length) {
            console.error(
              '[cart] Add to cart blocked: no Shopify merchandiseId was provided. In Shopify Admin, make sure this product has at least one purchasable variant.',
            );
            return;
          }
          onClick?.();
        }}
        className={className}
        disabled={disabled ?? fetcher.state !== 'idle'}
      >
        {children}
      </button>
    </>
  );
}
