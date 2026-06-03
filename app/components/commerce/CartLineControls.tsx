import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {CartForm} from '@shopify/hydrogen';
import {Minus, Plus} from 'lucide-react';
import type {ShopifyCartLine} from '~/lib/commerce/cart-lines';

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
  className,
}: {
  lineIds: string[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className={className}
      >
        Remove
      </button>
    </CartForm>
  );
}

export function CartLineQuantityControls({
  line,
  compact = false,
}: {
  line: ShopifyCartLine;
  compact?: boolean;
}) {
  if (!line || typeof line.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic} = line;
  const merchandiseUnavailable = line.merchandise.availableForSale === false;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));
  const btnClass = compact ? 'p-1.5' : 'p-2 hover:bg-cream';

  return (
    <div className="flex items-center border border-border">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          type="submit"
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic || merchandiseUnavailable}
          className={btnClass}
        >
          <Minus className="h-3 w-3" strokeWidth={compact ? 1.2 : 1.4} />
        </button>
      </CartLineUpdateButton>
      <span className={`text-sm ${compact ? 'px-3' : 'px-4'}`}>{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          type="submit"
          aria-label="Increase quantity"
          disabled={!!isOptimistic || merchandiseUnavailable}
          className={btnClass}
        >
          <Plus className="h-3 w-3" strokeWidth={compact ? 1.2 : 1.4} />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

export function CartLineRemoveControl({
  line,
  className,
}: {
  line: ShopifyCartLine;
  className?: string;
}) {
  return (
    <CartLineRemoveButton
      lineIds={[line.id]}
      disabled={!!line.isOptimistic}
      className={className}
    />
  );
}
