import {Link} from 'react-router';
import {Heart, ShoppingBag} from 'lucide-react';
import {useStore} from '~/lib/commerce/cart-store';
import {AddToCartButton} from '~/components/AddToCartButton';
import {formatMoney} from '~/lib/commerce/format-money';
import {
  getMetafieldValue,
  logMissingShopifyField,
  tagIncludes,
} from '~/lib/commerce/shopify-fields';

type Props = {
  product: any;
  index?: number;
  aspect?: 'tall' | 'square';
};

export function ProductCard({
  product,
  aspect = 'tall',
}: Props) {
  const wishlist = useStore((s) => s.wishlist);
  const toggle = useStore((s) => s.toggleWishlist);
  const saved = wishlist.includes(product.handle);
  const openDrawer = useStore((s) => s.openDrawer);

  const images = product.images?.nodes ?? [];

  const firstImage =
    images[0]?.url || product.featuredImage?.url;

  const secondImage =
    images[1]?.url ||
    images[0]?.url ||
    product.featuredImage?.url;

  const price =
    product.priceRange?.minVariantPrice;

  const subtitle = getMetafieldValue(product, 'subtitle');
  const variant =
    product.variants?.nodes?.find((node: any) => node.availableForSale) ??
    product.variants?.nodes?.[0];
  const variantId = variant?.id;
  const isNew =
    tagIncludes(product.tags, 'new-arrival') ||
    tagIncludes(product.tags, 'new');

  if (!firstImage) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.featuredImage or product.images',
      'Add at least one product image in Shopify Admin so product cards can match the TanStack gallery UI.',
    );
  }
  if (!subtitle) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.subtitle',
      'Create a product metafield custom.subtitle in Shopify Admin for the product card subtitle.',
    );
  }
  if (!variantId) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product.variants',
      'Add at least one product variant in Shopify Admin so Add to bag can use Shopify cart lines.',
    );
  }

    return (
      <div className="group block">
        <div
          className={`relative overflow-hidden bg-cream ${
            aspect === 'tall'
              ? 'aspect-[3/4]'
              : 'aspect-square'
          }`}
        >
          <Link
            to={`/products/${product.handle}`}
            className="absolute inset-0 z-0"
          />

          {firstImage && (
            <img
              src={firstImage}
              alt={images[0]?.altText ?? product.featuredImage?.altText ?? product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-0"
            />
          )}

          {secondImage && (
            <img
              src={secondImage}
              alt={images[1]?.altText ?? images[0]?.altText ?? product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover scale-[1.04] opacity-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:scale-100"
            />
          )}
    
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.handle);
            }}
            aria-label={
              saved
                ? 'Remove from wishlist'
                : 'Save to wishlist'
            }
            className="absolute top-4 right-4 z-20 p-1.5 text-ink/70 hover:text-gold transition-colors"
          >
            <Heart
              className="h-4 w-4"
              strokeWidth={1.2}
              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
    
          {isNew && (
            <span className="absolute top-4 left-4 z-20 small-caps text-ink/60">
              New
            </span>
          )}
    
          <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 translate-y-full opacity-0 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            {variantId && (
              <AddToCartButton
              className="block w-full"
              lines={[
                {
                  merchandiseId: variantId,
                  quantity: 1,
                  selectedVariant: variant,
                },
              ]}
              onClick={() => openDrawer('cart')}
              >
                <div className="flex h-14 w-full items-center justify-center gap-3 border border-ivory/15 bg-ink/95 text-ivory shadow-[0_16px_36px_rgba(0,0,0,0.22)] backdrop-blur-sm small-caps hover:border-gold hover:bg-gold transition-colors cursor-pointer">
                  <ShoppingBag
                    className="h-3.5 w-3.5"
                    strokeWidth={1.4}
                  />
                  Add to bag
                </div>
              </AddToCartButton>
            )}
          </div>
        </div>
    
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <div>
            <Link to={`/products/${product.handle}`}>
              <p className="font-serif text-xl text-ink hover:text-gold transition-colors">
                {product.title}
              </p>
            </Link>
    
            <p className="text-xs italic text-ink/55">
              {subtitle}
            </p>
          </div>
    
          <p className="text-sm text-ink/80 whitespace-nowrap">
            {price ? formatMoney(price.amount, price.currencyCode) : ''}
          </p>
        </div>
      </div>
    );
}
