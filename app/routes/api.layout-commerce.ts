import type {Route} from './+types/api.layout-commerce';

export async function loader({context}: Route.LoaderArgs) {
  try {
    const layoutCommerce = await context.storefront.query(
      LAYOUT_COMMERCE_QUERY,
      {cache: context.storefront.CacheLong()},
    );
    return json({layoutCommerce});
  } catch (error) {
    console.error('[layout-commerce] Shopify query failed:', error);
    return json({message: 'Atelier navigation is unavailable.'}, 502);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}

const LAYOUT_COMMERCE_QUERY = `#graphql
  query LayoutCommerce($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 30) {
      nodes {
        id
        title
        handle
        image {
          id
          url
          altText
          width
          height
        }
        metafields(identifiers: [
          {namespace: "custom", key: "tagline"},
          {namespace: "custom", key: "category"}
        ]) {
          key
          namespace
          value
        }
      }
    }
    products(first: 50) {
      nodes {
        id
        title
        handle
        vendor
        productType
        tags
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        metafields(identifiers: [
          {namespace: "custom", key: "subtitle"},
          {namespace: "custom", key: "fabric"},
          {namespace: "custom", key: "color"},
          {namespace: "custom", key: "occasions"}
        ]) {
          key
          namespace
          value
        }
      }
    }
  }
` as const;
