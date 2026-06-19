import type {Route} from './+types/api.product-quick-view';

export async function loader({context, request}: Route.LoaderArgs) {
  const handle = new URL(request.url).searchParams.get('handle')?.trim();
  if (!handle) {
    return json({message: 'Product handle is required.'}, 400);
  }

  const {product} = await context.storefront.query(QUICK_VIEW_PRODUCT_QUERY, {
    cache: context.storefront.CacheShort(),
    variables: {handle},
  });
  if (!product) return json({message: 'Product not found.'}, 404);

  return json({product});
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=60',
    },
  });
}

const QUICK_VIEW_PRODUCT_QUERY = `#graphql
  query QuickViewProduct(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      productType
      description
      featuredImage {
        id
        url
        altText
        width
        height
      }
      images(first: 3) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          image {
            id
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          product {
            id
            handle
            title
            vendor
            productType
          }
          selectedOptions {
            name
            value
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      metafields(identifiers: [
        {namespace: "custom", key: "subtitle"}
        {namespace: "custom", key: "fabric"}
      ]) {
        key
        namespace
        value
      }
    }
  }
` as const;
