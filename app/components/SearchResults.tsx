import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) return null;

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) return null;

  return (
    <section>
      <h2 className="small-caps text-ink/45">Journal</h2>
      <div className="mt-4 grid gap-3">
        {articles.nodes.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link
              key={article.id}
              prefetch="intent"
              to={articleUrl}
              className="block border-b border-border py-3 font-serif text-xl text-ink transition-colors hover:text-gold"
            >
              {article.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) return null;

  return (
    <section>
      <h2 className="small-caps text-ink/45">Pages</h2>
      <div className="mt-4 grid gap-3">
        {pages.nodes.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link
              key={page.id}
              prefetch="intent"
              to={pageUrl}
              className="block border-b border-border py-3 font-serif text-xl text-ink transition-colors hover:text-gold"
            >
              {page.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) return null;

  return (
    <section>
      <h2 className="small-caps text-ink/45">Pieces</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const itemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product.selectedOrFirstAvailableVariant?.price;
            const image = product.selectedOrFirstAvailableVariant?.image;

            return (
              <Link
                key={product.id}
                prefetch="intent"
                to={productUrl}
                className="grid grid-cols-[72px_1fr] items-center gap-4 border-b border-border py-4 transition-colors hover:text-gold sm:grid-cols-[90px_1fr]"
              >
                {image ? (
                  <Image
                    data={image}
                    alt={product.title}
                    width={180}
                    className="aspect-[3/4] w-full bg-cream object-cover"
                  />
                ) : (
                  <span className="aspect-[3/4] w-full bg-cream" />
                )}
                <div>
                  <p className="font-serif text-xl leading-tight text-ink">
                    {product.title}
                  </p>
                  <small className="mt-2 block text-sm text-ink/55">
                    {price && <Money data={price} />}
                  </small>
                </div>
              </Link>
            );
          });

          return (
            <div>
              <div className="mb-4 text-sm text-ink/45">
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>Load previous</span>}
                </PreviousLink>
              </div>
              <div className="grid gap-1">{itemsMarkup}</div>
              <div className="mt-5 text-sm text-ink/45">
                <NextLink>
                  {isLoading ? 'Loading...' : <span>Load more</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="max-w-lg font-serif text-2xl leading-relaxed text-ink/55">
      No results yet. Try a fabric, silhouette, color, or occasion.
    </p>
  );
}
