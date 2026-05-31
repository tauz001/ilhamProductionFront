import type {OptimisticCartLine} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type ShopifyCartLine = OptimisticCartLine<CartApiQueryFragment>;

/** Cart from root loader or `useOptimisticCart` (structurally compatible). */
export type RootCart = CartApiQueryFragment | null;

const loggedMissingCartFields = new Set<string>();

function logMissingCartField(field: string, adminAction: string) {
  if (loggedMissingCartFields.has(field)) return;
  loggedMissingCartFields.add(field);
  console.warn(`Missing Shopify field: ${field}. ${adminAction}`);
}

export function getVisibleCartLines(cart: RootCart | undefined): ShopifyCartLine[] {
  const nodes = cart?.lines?.nodes ?? [];
  return nodes.filter((line) => {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      return false;
    }
    return true;
  }) as ShopifyCartLine[];
}

export function getLineSizeLabel(line: ShopifyCartLine): string {
  const size = line.merchandise.selectedOptions?.find(
    (o) => o.name.toLowerCase() === 'size',
  );
  if (!size?.value) {
    logMissingCartField(
      'variant selected option: Size',
      'Add a Size option to the product variants in Shopify Admin if the UI should show garment size.',
    );
  }
  return size?.value ?? line.merchandise.title;
}

export function getLineProductType(line: ShopifyCartLine): string {
  const product = line.merchandise.product;
  if ('productType' in product && product.productType) {
    return product.productType as string;
  }
  logMissingCartField(
    'product.productType',
    'Set Product type in Shopify Admin so cart line items can match the TanStack product category label.',
  );
  return product.vendor ?? '';
}
