import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import {FadeUp} from '~/components/editorial/MaskedReveal';
import {
  getMetafieldValue,
  logMissingShopifyField,
} from '~/lib/commerce/shopify-fields';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Collections — ilham'},
    {
      name: 'description',
      content: 'Browse ilham collections from Shopify.',
    },
    {property: 'og:title', content: 'Collections — ilham'},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY);
  collections.nodes.forEach(logCollectionRequirements);
  return {collections};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const items = collections.nodes ?? [];

  return (
    <div className="pt-32 md:pt-44">
      <header className="mx-auto max-w-[1500px] px-6 pb-20 text-center lg:px-12">
        <p className="small-caps text-ink/50">The Atelier</p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl">
          All Collections
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-ink/65 leading-relaxed">
          Shopify collections, curated for the ilham atelier.
        </p>
      </header>
      <div className="mx-auto max-w-[1500px] grid grid-cols-1 gap-x-6 gap-y-20 px-6 pb-32 md:grid-cols-2 lg:px-12">
        {items.map((collection: any, index: number) => {
          const tagline = getCollectionMetafield(collection, 'tagline');
          const category = getCollectionMetafield(collection, 'category');
          return (
            <FadeUp key={collection.handle} delay={(index % 2) * 0.12}>
              <Link to={`/collections/${collection.handle}`} className="group block">
                <div
                  className={`relative overflow-hidden bg-cream ${
                    index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                  }`}
                >
                  {collection.image?.url && (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/30" />
                  {category && (
                    <p className="absolute top-6 left-6 small-caps text-ivory">
                      {category}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex items-baseline justify-between">
                  <h2 className="font-display text-4xl md:text-5xl">
                    {collection.title}
                  </h2>
                  <span className="small-caps text-ink/50">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                {tagline && <p className="mt-2 italic text-ink/60">{tagline}</p>}
              </Link>
            </FadeUp>
          );
        })}
      </div>
    </div>
  );
}

function getCollectionMetafield(collection: any, key: string) {
  const value = getMetafieldValue(collection, key);
  if (!value) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      `collection metafield custom.${key}`,
      `Create a collection metafield custom.${key} in Shopify Admin to fully match the TanStack collections index.`,
    );
  }
  return value;
}

function logCollectionRequirements(collection: any) {
  if (!collection.image?.url) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      'collection.image',
      'Add a collection image in Shopify Admin so the collections index can match the TanStack visual cards.',
    );
  }
}

const COLLECTIONS_QUERY = `#graphql
  query StoreCollections(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: 50) {
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
  }
` as const;
