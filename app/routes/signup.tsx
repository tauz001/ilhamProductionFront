import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/signup';
import {motion} from 'framer-motion';
import {Bookmark, Gift, ShieldCheck, Sparkles} from 'lucide-react';
import {UrduCalligraphy} from '~/components/editorial/UrduCalligraphy';
import {easeSilk} from '~/lib/motion/variants';
import {logMissingShopifyField} from '~/lib/commerce/shopify-fields';
import {privatePageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return privatePageMeta(
    'Create Account - ilham',
    'Begin your ilham atelier through Shopify Customer Accounts.',
    '/signup',
  );
};

export async function loader({context}: Route.LoaderArgs) {
  if (await context.customerAccount.isLoggedIn()) {
    return redirect('/account');
  }

  const data = await context.storefront
    .query(AUTH_VISUAL_QUERY)
    .catch((error: Error) => {
      console.error('[auth] Shopify signup visual query failed:', error);
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

export default function SignupPage() {
  const {image} = useLoaderData<typeof loader>();

  return (
    <div className="relative min-h-screen bg-ivory pt-20 lg:pt-0">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <div className="relative flex items-center justify-center px-6 py-16 lg:px-20">
          <UrduCalligraphy
            word="آغاز"
            variant="antique"
            opacity={0.04}
            size="text-[120px]"
            className="absolute left-6 top-10"
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
            <h1 className="mt-12 font-display text-5xl text-ink leading-[1.05]">
              Begin your <em className="font-serif italic text-gold">atelier</em>.
            </h1>
            <p className="mt-3 text-sm italic text-ink/55">
              Account creation is handled securely by Shopify Customer Accounts.
            </p>

            <a
              href="/account/login"
              className="mt-10 block w-full bg-ink py-4 small-caps text-center text-ivory hover:bg-gold transition-colors"
            >
              Continue with Shopify
            </a>

            <p className="mt-10 text-center text-sm text-ink/60">
              Already part of the atelier?{' '}
              <Link to="/login" className="story-link text-ink">
                Sign in
              </Link>
            </p>

            <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-ink/40">
              <ShieldCheck className="h-3 w-3" strokeWidth={1.4} /> Secured by Shopify Customer Accounts
            </p>
          </motion.div>
        </div>

        <div className="relative hidden overflow-hidden bg-cream lg:block">
          {image?.url && (
            <img
              src={image.url}
              alt={image.altText ?? 'ilham artisans at work'}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/60 via-ivory/40 to-ink/60" />
          <UrduCalligraphy
            word="حرفہ"
            variant="ivory"
            opacity={0.16}
            size="text-[30vw]"
            className="absolute right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2"
          />

          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <p className="small-caps text-ivory/80">As a ilham member</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] text-ivory">
              Privileges of the atelier.
            </h2>

            <ul className="mt-10 space-y-6 text-ivory/90">
              <Benefit
                icon={<Bookmark className="h-4 w-4" strokeWidth={1.4} />}
                title="Saved pieces & wishlists"
                body="Quietly hold the pieces that move you. We'll alert you to fresh batches."
              />
              <Benefit
                icon={<Sparkles className="h-4 w-4" strokeWidth={1.4} />}
                title="Private seasonal previews"
                body="See new collections before they are released to the world."
              />
              <Benefit
                icon={<Gift className="h-4 w-4" strokeWidth={1.4} />}
                title="A welcome ritual"
                body="A hand-calligraphed note and a sample of fabric, posted with your first order."
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-content-center rounded-full border border-ivory/30 text-ivory">
        {icon}
      </span>
      <div>
        <p className="font-serif text-lg text-ivory">{title}</p>
        <p className="text-sm text-ivory/70">{body}</p>
      </div>
    </li>
  );
}

const AUTH_VISUAL_QUERY = `#graphql
  query SignupVisual($country: CountryCode, $language: LanguageCode)
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
