import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/login';
import {motion} from 'framer-motion';
import {ShieldCheck} from 'lucide-react';
import {UrduCalligraphy} from '~/components/editorial/UrduCalligraphy';
import {easeSilk} from '~/lib/motion/variants';
import {logMissingShopifyField} from '~/lib/commerce/shopify-fields';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Sign In - ilham'},
    {
      name: 'description',
      content: 'Return to your ilham atelier through Shopify Customer Accounts.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  if (await context.customerAccount.isLoggedIn()) {
    return redirect('/account');
  }

  const data = await context.storefront
    .query(AUTH_VISUAL_QUERY)
    .catch((error: Error) => {
      console.error('[auth] Shopify auth visual query failed:', error);
      return null;
    });

  const image = data?.products?.nodes?.[0]?.featuredImage ?? null;
  if (!image?.url) {
    logMissingShopifyField(
      'auth',
      'products.featuredImage',
      'Add at least one product image in Shopify Admin so login/signup pages can match the TanStack visual layout.',
    );
  }

  return {image};
}

export default function LoginPage() {
  const {image} = useLoaderData<typeof loader>();

  return (
    <div className="relative min-h-screen bg-ivory pt-20 lg:pt-0">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ink lg:block">
          {image?.url && (
            <img
              src={image.url}
              alt={image.altText ?? 'ilham atelier'}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <UrduCalligraphy
            word="الہام"
            variant="ivory"
            opacity={0.18}
            size="text-[34vw]"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute bottom-16 left-12 right-12 text-ivory">
            <p className="small-caps text-ivory/60">Welcome back</p>
            <h2 className="mt-4 font-display text-5xl leading-[1.05]">
              Your atelier,<br />
              <em className="font-serif italic text-gold-soft">quietly remembered.</em>
            </h2>
            <p className="mt-6 max-w-md text-sm text-ivory/70">
              Orders, profile, and addresses are secured by Shopify Customer Accounts.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-16 lg:px-20">
          <UrduCalligraphy
            word="خوش آمدید"
            variant="antique"
            opacity={0.04}
            size="text-[120px]"
            className="absolute right-6 top-10"
          />

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.9, ease: easeSilk}}
            className="w-full max-w-md"
          >
            <Link to="/" className="font-display text-3xl tracking-[0.18em] text-ink">
              ilham
            </Link>
            <h1 className="mt-12 font-display text-5xl text-ink">Sign in</h1>
            <p className="mt-3 text-sm italic text-ink/55">
              Return through Shopify&apos;s secure customer account flow.
            </p>

            <a
              href="/account/login"
              className="mt-12 block w-full bg-ink py-4 small-caps text-center text-ivory hover:bg-gold transition-colors"
            >
              Continue with Shopify
            </a>

            <p className="mt-10 text-center text-sm text-ink/60">
              New to ilham?{' '}
              <Link to="/signup" className="story-link text-ink">
                Create an atelier account
              </Link>
            </p>

            <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-ink/40">
              <ShieldCheck className="h-3 w-3" strokeWidth={1.4} /> Secured by Shopify Customer Accounts
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const AUTH_VISUAL_QUERY = `#graphql
  query AuthVisual($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 1, sortKey: BEST_SELLING) {
      nodes {
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;
