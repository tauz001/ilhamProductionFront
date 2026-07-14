import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {isProductSoldOut} from '~/lib/commerce/product-availability';
import {getProductListingUrl} from '~/lib/commerce/colour-listings';

export function ProductItem({
  product,
  loading,
}: {
  product: any;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = getProductListingUrl(product);
  const image = product.featuredImage;
  const price =
    product.selectedOrFirstAvailableVariant?.price ??
    product.priceRange.minVariantPrice;
  const soldOut = isProductSoldOut(product);
  return (
    <Link
      className="group block min-w-0"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      aria-label={`View ${product.title}${soldOut ? ' (sold out)' : ''}`}
    >
      {image && (
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <Image
            alt={image.altText || product.title}
            aspectRatio="3/4"
            data={image}
            loading={loading}
            sizes="(min-width: 1280px) 330px, (min-width: 768px) 25vw, 50vw"
            className={`h-full w-full object-cover transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-silk)] group-hover:scale-[1.025] ${
              soldOut ? 'saturate-[0.72]' : ''
            }`}
          />
          {soldOut ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/10">
              <span className="border border-ivory/70 bg-ivory/90 px-4 py-2 text-[10px] text-ink/70 shadow-[0_12px_30px_rgba(28,22,17,0.14)] small-caps">
                Sold out
              </span>
            </div>
          ) : null}
        </div>
      )}
      <h2 className="mt-4 truncate font-serif text-lg leading-snug transition-colors duration-[var(--motion-feedback)] group-hover:text-brown sm:text-xl">
        {product.title}
      </h2>
      <span className="mt-1 block text-sm text-ink/55">
        <Money data={price} />
      </span>
    </Link>
  );
}
