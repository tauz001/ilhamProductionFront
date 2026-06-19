import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="group block min-w-0"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <div className="aspect-[3/4] overflow-hidden bg-cream">
          <Image
            alt={image.altText || product.title}
            aspectRatio="3/4"
            data={image}
            loading={loading}
            sizes="(min-width: 1280px) 330px, (min-width: 768px) 25vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-silk)] group-hover:scale-[1.025]"
          />
        </div>
      )}
      <h2 className="mt-4 truncate font-serif text-lg leading-snug transition-colors duration-[var(--motion-feedback)] group-hover:text-brown sm:text-xl">
        {product.title}
      </h2>
      <span className="mt-1 block text-sm text-ink/55">
        <Money data={product.priceRange.minVariantPrice} />
      </span>
    </Link>
  );
}
