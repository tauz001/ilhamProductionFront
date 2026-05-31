import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/about';
import {MaskedReveal, FadeUp} from '~/components/editorial/MaskedReveal';
import {ParallaxImage} from '~/components/editorial/ParallaxImage';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {logMissingShopifyField} from '~/lib/commerce/shopify-fields';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Heritage — ilham'},
    {
      name: 'description',
      content:
        'The story of ilham — a slow atelier preserving Lucknowi chikankari, one stitch at a time.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(ABOUT_VISUALS_QUERY);
  const images =
    data.products?.nodes
      ?.map((product: any) => product.featuredImage)
      .filter((image: any) => image?.url) ?? [];

  if (images.length < 4) {
    logMissingShopifyField(
      'about',
      'products.featuredImage',
      'Add at least four published Shopify products with featured images so the About page can match the TanStack editorial image layout.',
    );
  }

  return {images};
}

export default function About() {
  const {images} = useLoaderData<typeof loader>();
  const hero = images[0];
  const artisan = images[1] ?? hero;
  const fabric = images[2] ?? hero;
  const editorial = images[3] ?? hero;
  const editorialTwo = images[4] ?? artisan;

  const timeline = [
    {
      year: '1640s',
      title: "An empress' gift",
      body: 'Nur Jahan brings whitework needlecraft from Persia into the courts of Awadh.',
    },
    {
      year: '1800s',
      title: 'A vocabulary forms',
      body: 'Chikankari develops thirty-two distinctive stitches across the lanes of old Lucknow.',
    },
    {
      year: '1947',
      title: 'Surviving partition',
      body: 'Master artisans flee and return; the craft is held together in courtyards by women.',
    },
    {
      year: 'Today',
      title: 'ilham',
      body: 'A small atelier, ten karigars, one promise — name what was once anonymous.',
    },
  ];

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        {hero?.url && (
          <ParallaxImage
            src={hero.url}
            alt={hero.altText ?? 'ilham heritage'}
            className="absolute inset-0"
            imgClassName="brightness-[0.7]"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center text-ivory px-6">
          <p className="small-caps text-ivory/70">Our Heritage</p>
          <h1 className="mt-6 font-display text-6xl md:text-[9vw] leading-[0.95]">
            <MaskedReveal>The art</MaskedReveal>
            <br />
            <MaskedReveal delay={0.2}>
              <em className="italic font-serif">we refuse to lose.</em>
            </MaskedReveal>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-32 text-center md:py-44">
        <p className="small-caps text-ink/50">Hands behind ilham</p>
        <h2 className="mt-10 font-display text-5xl md:text-6xl text-balance">
          Not mass produced. Not machine kissed. Not in a hurry.
        </h2>
        <p className="mt-10 text-base leading-relaxed text-ink/65">
          ilham exists because a craft does not survive on nostalgia alone. It
          survives because someone insists on paying for the slowness, naming
          the hands, and refusing the shortcut.
        </p>
        <ChikanMotif className="mx-auto mt-12 h-6 w-40 text-gold" />
      </section>

      <section className="grid gap-0 md:grid-cols-2 bg-cream">
        {artisan?.url && (
          <ParallaxImage
            src={artisan.url}
            alt={artisan.altText ?? 'Artisan hands'}
            className="aspect-[4/5] md:aspect-auto md:h-full"
          />
        )}
        <div className="flex flex-col justify-center px-8 py-20 md:px-20 md:py-32">
          <p className="small-caps text-ink/50">From Lucknow to the world</p>
          <h3 className="mt-6 font-display text-5xl text-balance">
            Every stitch has a <em className="italic font-serif">human</em> touch.
          </h3>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Each garment travels through hands, washing, finishing, pressing,
            and folding before Shopify checkout carries it to your door.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
        <p className="small-caps text-ink/50 text-center">A timeline</p>
        <h3 className="mt-6 text-center font-display text-5xl md:text-6xl">
          Six centuries of whitework
        </h3>
        <ol className="mt-20 grid gap-12 md:grid-cols-4">
          {timeline.map((item, index) => (
            <FadeUp key={item.year} delay={index * 0.1}>
              <li className="relative border-t border-border pt-6">
                <span className="font-display text-3xl text-gold">{item.year}</span>
                <h4 className="mt-4 font-serif text-2xl">{item.title}</h4>
                <p className="mt-3 text-sm text-ink/65 leading-relaxed">
                  {item.body}
                </p>
              </li>
            </FadeUp>
          ))}
        </ol>
      </section>

      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-[1500px] gap-16 px-6 py-32 md:grid-cols-2 md:px-12">
          {fabric?.url && (
            <ParallaxImage
              src={fabric.url}
              alt={fabric.altText ?? 'Fabric'}
              className="aspect-[4/5]"
            />
          )}
          <div className="flex flex-col justify-center">
            <p className="small-caps text-ivory/50">A promise</p>
            <h3 className="mt-6 font-display text-5xl md:text-6xl text-balance">
              Slow is the only way it survives.
            </h3>
            <p className="mt-6 text-ivory/70 leading-relaxed">
              We pay for slowness, name the hands, and let the work keep its
              human pace.
            </p>
            <Link
              to="/collections"
              className="mt-10 small-caps border border-ivory self-start px-10 py-4 hover:bg-ivory hover:text-ink transition-colors"
            >
              Begin with a piece
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        {editorial?.url && (
          <ParallaxImage
            src={editorial.url}
            alt={editorial.altText ?? 'Editorial'}
            className="aspect-[4/5]"
          />
        )}
        {editorialTwo?.url && (
          <ParallaxImage
            src={editorialTwo.url}
            alt={editorialTwo.altText ?? 'Editorial'}
            className="aspect-[4/5]"
          />
        )}
      </section>
    </>
  );
}

const ABOUT_VISUALS_QUERY = `#graphql
  query AboutVisuals($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 5) {
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
