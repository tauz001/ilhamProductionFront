import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {seoMeta} from '~/lib/seo';
import {EditorialHeader} from '~/components/editorial/EditorialHeader';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Store Policies - ilham',
    description:
      'Read ilham policies for shipping, returns, privacy, subscriptions, and terms of service.',
    path: '/policies',
  });

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-ivory">
      <EditorialHeader
        eyebrow="Atelier information"
        title="Store Policies"
        intro="Clear guidance for ordering, delivery, returns, privacy, and your experience with ilham."
      />
      <section className="mx-auto max-w-4xl px-6 pb-28 md:pb-36 lg:px-12">
        {policies.map((policy, index) => (
          <Link
            key={policy.id}
            to={`/policies/${policy.handle}`}
            prefetch="intent"
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-ink/15 py-6 last:border-b md:gap-8 md:py-8"
          >
            <span className="small-caps text-ink/40">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="font-serif text-2xl transition-transform duration-[var(--motion-overlay)] ease-[var(--ease-silk)] group-hover:translate-x-1.5 md:text-4xl">
              {policy.title}
            </h2>
            <span
              aria-hidden
              className="text-xl text-gold transition-transform duration-[var(--motion-overlay)] ease-[var(--ease-silk)] group-hover:translate-x-1"
            >
              &#8594;
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
