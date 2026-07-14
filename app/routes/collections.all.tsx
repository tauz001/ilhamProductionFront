import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {useMemo} from 'react';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {seoMeta} from '~/lib/seo';
import {EditorialHeader} from '~/components/editorial/EditorialHeader';
import {compareProductsByAvailability} from '~/lib/commerce/product-availability';
import {expandColourVariantListings} from '~/lib/commerce/colour-listings';

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: 'All Chikankari Pieces - ilham',
    description:
      'Browse all ilham Lucknowi chikankari pieces available through the atelier.',
    path: '/collections/all',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();
  const merchandisedProducts = useMemo(
    () => ({
      ...products,
      nodes: expandColourVariantListings(
        [...(products?.nodes ?? [])].sort(compareProductsByAvailability),
      ),
    }),
    [products],
  );

  return (
    <main className="min-h-screen bg-ivory">
      <EditorialHeader
        eyebrow="The complete edit"
        title="All Pieces"
        intro="Explore every available ilham piece, brought together in one considered collection."
      />
      <section className="mx-auto max-w-[1500px] px-4 pb-28 sm:px-6 md:pb-36 lg:px-12">
        <PaginatedResourceSection<CollectionItemFragment>
          connection={merchandisedProducts}
          resourcesClassName="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 md:gap-y-20 lg:grid-cols-4"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </section>
    </main>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          title
          availableForSale
          image {
            id
            altText
            url
            width
            height
          }
          price {
            ...MoneyCollectionItem
          }
          compareAtPrice {
            ...MoneyCollectionItem
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "split_colour_listings"},
      {namespace: "custom", key: "base_title"},
      {namespace: "custom", key: "connected_colour_products"},
      {namespace: "custom", key: "connected_color_products"}
    ]) {
      key
      namespace
      value
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: CREATED_AT,
      reverse: true
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
