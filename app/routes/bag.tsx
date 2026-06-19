import {useLoaderData} from 'react-router';
import type {Route} from './+types/bag';
import {BagPage, type BagRecommendation} from '~/components/commerce/BagPage';
import {privatePageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return privatePageMeta(
    'The Bag - ilham',
    'Review the hand-embroidered pieces in your bag before checkout.',
    '/bag',
  );
};

const BAG_RECOMMENDATIONS_QUERY = `#graphql
  query BagRecommendations($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {cart, storefront} = context;

  const [cartResult, recommendationsResult] = await Promise.all([
    cart.get(),
    storefront.query(BAG_RECOMMENDATIONS_QUERY).catch((error: Error) => {
      console.error('[bag] recommendations query failed:', error);
      return null;
    }),
  ]);

  const recommendations: BagRecommendation[] =
    recommendationsResult?.products?.nodes?.map(
      (p: {
        id: string;
        handle: string;
        title: string;
        featuredImage?: {url: string; altText?: string | null} | null;
        priceRange?: {
          minVariantPrice?: {amount: string; currencyCode: string} | null;
        } | null;
      }) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        image: p.featuredImage,
        price: p.priceRange?.minVariantPrice ?? null,
      }),
    ) ?? [];

  return {cart: cartResult, recommendations};
}

export default function BagRoute() {
  const {cart, recommendations} = useLoaderData<typeof loader>();
  return <BagPage cart={cart} recommendations={recommendations} />;
}
