import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {seoMeta} from '~/lib/seo';
import {EditorialHeader} from '~/components/editorial/EditorialHeader';

export const meta: Route.MetaFunction = ({data}) => {
  const blog = data?.blog;
  return seoMeta({
    title: blog?.seo?.title ?? `${blog?.title ?? 'Journal'} - ilham`,
    description:
      blog?.seo?.description ??
      'Read ilham stories on Lucknowi chikankari, craft, and styling.',
    path: `/blogs/${blog?.handle ?? ''}`,
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <main className="min-h-screen bg-ivory">
      <EditorialHeader
        eyebrow="The ilham journal"
        title={blog.title}
        intro={
          blog.seo?.description ??
          'Notes on Lucknowi chikankari, considered dressing, and the hands behind the craft.'
        }
      />
      <section className="mx-auto max-w-[1320px] px-6 pb-28 md:pb-36 lg:px-12">
        <PaginatedResourceSection<ArticleItemFragment>
          connection={articles}
          resourcesClassName="grid gap-x-8 md:grid-cols-2 lg:gap-x-12"
        >
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </section>
    </main>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  return (
    <article className="group mb-16 md:mb-24" key={article.id}>
      <Link
        prefetch="intent"
        to={`/blogs/${article.blog.handle}/${article.handle}`}
      >
        {article.image && (
          <div className="aspect-[4/3] overflow-hidden bg-cream md:aspect-[3/2]">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="3/2"
              data={article.image}
              loading={loading}
              sizes="(min-width: 1320px) 600px, (min-width: 768px) 46vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-silk)] group-hover:scale-[1.025]"
            />
          </div>
        )}
        <div className="mt-6 border-t border-ink/15 pt-5 md:mt-8 md:pt-6">
          <time className="small-caps text-ink/45" dateTime={article.publishedAt!}>
            {publishedAt}
          </time>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight transition-colors duration-[var(--motion-feedback)] group-hover:text-brown md:text-5xl">
            {article.title}
          </h2>
          <span className="story-link mt-5 text-xs uppercase tracking-[0.24em] text-ink/65">
            Read story
          </span>
        </div>
      </Link>
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
