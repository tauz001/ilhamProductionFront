import {useLoaderData} from 'react-router';
import type {Route} from './+types/bag';
import {BagPage, type BagRecommendation} from '~/components/commerce/BagPage';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'The Bag - ilham'},
    {
      name: 'description',
      content:
        'Review the hand-embroidered pieces in your bag, gift wrapping, and shipping with ilham.',
    },
    {property: 'og:title', content: 'The Bag - ilham'},
    {
      property: 'og:description',
      content:
        'Your selection of Lucknowi chikankari, prepared for checkout.',
    },
  ];
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
