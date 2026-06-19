import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {seoMeta} from '~/lib/seo';
import {EditorialHeader} from '~/components/editorial/EditorialHeader';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: 'Journal - ilham',
    description: 'Stories from ilham on Lucknowi chikankari, craft, and care.',
    path: '/blogs',
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-ivory">
      <EditorialHeader
        eyebrow="Notes from the atelier"
        title="The Journal"
        intro="Stories of handwork, heritage, and the quiet details that give every ilham piece its character."
      />
      <section className="mx-auto max-w-5xl px-6 pb-28 md:pb-36 lg:px-12">
        <PaginatedResourceSection<BlogNode> connection={blogs}>
          {({node: blog, index}) => (
            <Link
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-t border-ink/15 py-7 transition-colors duration-[var(--motion-feedback)] last:border-b hover:border-gold/60 md:gap-10 md:py-10"
              key={blog.handle}
              prefetch="intent"
              to={`/blogs/${blog.handle}`}
            >
              <span className="small-caps text-ink/40">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="font-display text-3xl transition-transform duration-[var(--motion-overlay)] ease-[var(--ease-silk)] group-hover:translate-x-1.5 md:text-5xl">
                {blog.title}
              </h2>
              <span
                aria-hidden
                className="text-2xl font-light text-gold transition-transform duration-[var(--motion-overlay)] ease-[var(--ease-silk)] group-hover:translate-x-1"
              >
                &#8594;
              </span>
            </Link>
          )}
        </PaginatedResourceSection>
      </section>
    </main>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
