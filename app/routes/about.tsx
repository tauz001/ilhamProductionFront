import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/about';
import {MaskedReveal, FadeUp} from '~/components/editorial/MaskedReveal';
import {ParallaxImage} from '~/components/editorial/ParallaxImage';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {
  getMetafieldImage,
  logMissingShopifyField,
} from '~/lib/commerce/shopify-fields';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: 'Heritage - ilham',
    description:
      'The story of ilham: Lucknow chikankari, artisan whitework, and the quiet luxury of hand embroidery from Awadh.',
    path: '/about',
  });
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
      'Add at least four published Shopify products with featured images so the About page can match the ilham editorial layout.',
    );
  }

  return {images, shop: data.shop};
}

export default function About() {
  const {images, shop} = useLoaderData<typeof loader>();
  const hero = getMetafieldImage(shop, 'about_hero') ?? images[0];
  const heroMobile = getMetafieldImage(shop, 'about_hero_mobile') ?? hero;
  const artisan =
    getMetafieldImage(shop, 'about_artisan') ?? images[1] ?? hero;
  const fabric = getMetafieldImage(shop, 'about_fabric') ?? images[2] ?? hero;
  const editorial =
    getMetafieldImage(shop, 'about_editorial_1') ?? images[3] ?? hero;
  const editorialTwo =
    getMetafieldImage(shop, 'about_editorial_2') ?? images[4] ?? artisan;

  const stitchLanguage = [
    {
      name: 'Bakhiya',
      detail: 'Shadow work that glows from beneath the fabric.',
    },
    {
      name: 'Phanda',
      detail: 'Tiny knots, raised like dew on cotton and chiffon.',
    },
    {
      name: 'Murri',
      detail: 'Rice-grain stitches, compact, patient, unmistakably hand made.',
    },
    {
      name: 'Jaali',
      detail: 'A net opened thread by thread without tearing the cloth.',
    },
  ];

  const atelierValues = [
    'Hand embroidery before speed',
    'Named artisan work over anonymous production',
    'Small batches, finished with restraint',
  ];

  const timeline = [
    {
      year: '17th c.',
      title: 'The Awadh court remembers',
      body: 'Persian whitework meets the refinement of Lucknow, where needle, muslin, and courtly taste begin to share one language.',
    },
    {
      year: '1800s',
      title: 'The lanes become ateliers',
      body: 'Chowk, Aminabad, and old mohallas carry the craft into homes, with women and karigars preserving stitches by practice.',
    },
    {
      year: 'Today',
      title: 'A slower luxury',
      body: 'ilham treats chikankari as heritage to be worn, paid for fairly, and passed forward without losing the hand behind it.',
    },
  ];

  return (
    <>
      <section className="relative min-h-[calc(100svh-136px)] overflow-hidden bg-ink md:h-[100svh] md:min-h-[660px]">
        {hero?.url && (
          <ParallaxImage
            src={hero.url}
            mobileSrc={heroMobile?.url ?? undefined}
            alt={hero.altText ?? 'Lucknow chikankari heritage'}
            className="absolute inset-0"
            imgClassName="brightness-[0.62]"
            loading="eager"
            fetchPriority="high"
            width={hero.width ?? undefined}
            height={hero.height ?? undefined}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/5 to-ink/52 md:from-ink/25 md:via-ink/10 md:to-ink/78" />
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1500px] flex-col px-6 pb-12 text-ivory md:pb-24 lg:px-12 lg:pb-28">
          <p className="small-caps text-ivory/68">Lucknow - Awadh - Whitework</p>
          <h1 className="mt-7 max-w-5xl font-display text-6xl leading-[0.93] tracking-[0.01em] md:text-[9vw] lg:text-[8vw]">
            <MaskedReveal>The hand</MaskedReveal>
            <br />
            <MaskedReveal delay={0.18}>
              <em className="font-serif italic">that carries heritage.</em>
            </MaskedReveal>
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-xl leading-relaxed text-ivory/78 md:text-2xl">
            ilham is a Lucknow atelier for chikankari that feels old in its
            patience and modern in its restraint.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ivory">
        <div className="mx-auto grid max-w-[1500px] gap-16 px-6 py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-36">
          <FadeUp className="self-start lg:sticky lg:top-36">
            <p className="small-caps text-ink/45">The house</p>
            <h2 className="mt-6 font-display text-5xl leading-[1.02] text-ink md:text-7xl">
              Luxury, when it is allowed to take time.
            </h2>
          </FadeUp>
          <div className="space-y-10">
            <p className="font-serif text-3xl leading-snug text-ink/80 md:text-4xl">
              Chikankari is not decoration placed on cloth. It is memory made
              visible through pressure, rhythm, and a needle moving quietly for
              days.
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-ink/62">
              Our work begins in Lucknow, where the softness of muslin, cotton,
              chiffon, georgette, and silk has carried hand embroidery through
              courts, courtyards, weddings, and everyday rituals. ilham keeps
              that language close: pale thread, measured negative space, and
              pieces that feel precious without becoming loud.
            </p>
            <div className="grid gap-px bg-border md:grid-cols-3">
              {atelierValues.map((value) => (
                <div key={value} className="bg-ivory p-6">
                  <ChikanMotif className="h-4 w-20 text-gold" />
                  <p className="mt-6 font-serif text-xl leading-snug text-ink">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid bg-cream md:grid-cols-2">
        {artisan?.url && (
          <ParallaxImage
            src={artisan.url}
            alt={artisan.altText ?? 'ilham artisan work'}
            className="aspect-[4/5] md:aspect-auto md:min-h-[760px]"
            imgClassName="brightness-[0.96]"
          />
        )}
        <div className="flex flex-col justify-center px-8 py-20 md:px-20 md:py-32">
          <p className="small-caps text-ink/45">The karigar</p>
          <h3 className="mt-6 font-display text-5xl leading-[1.05] text-balance md:text-6xl">
            The artisan is not behind the garment. The artisan is inside it.
          </h3>
          <p className="mt-8 max-w-xl leading-relaxed text-ink/66">
            Every ilham piece travels through drawing, tracing, embroidery,
            washing, finishing, pressing, and inspection. The work is intimate:
            a hand deciding tension, a wrist measuring repeat, an eye knowing
            when the cloth has enough.
          </p>
          <Link
            to="/collections"
            className="mt-10 self-start border border-ink px-9 py-4 small-caps text-ink transition-colors hover:bg-ink hover:text-ivory"
          >
            See the pieces
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-28 lg:px-12 lg:py-36">
        <div className="max-w-3xl">
          <p className="small-caps text-ink/45">The stitch language</p>
          <h3 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
            Chikankari speaks softly, but never simply.
          </h3>
        </div>
        <div className="mt-16 grid gap-px bg-border md:grid-cols-4">
          {stitchLanguage.map((stitch, index) => (
            <FadeUp key={stitch.name} delay={index * 0.08}>
              <article className="min-h-[260px] bg-ivory p-7">
                <span className="small-caps text-gold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4 className="mt-10 font-serif text-3xl text-ink">
                  {stitch.name}
                </h4>
                <p className="mt-4 text-sm leading-relaxed text-ink/58">
                  {stitch.detail}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-[1500px] gap-16 px-6 py-28 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-36">
          {fabric?.url && (
            <ParallaxImage
              src={fabric.url}
              alt={fabric.altText ?? 'Chikankari fabric detail'}
              className="aspect-[4/5]"
              imgClassName="brightness-[0.85]"
            />
          )}
          <div className="flex flex-col justify-center">
            <p className="small-caps text-ivory/45">The promise</p>
            <h3 className="mt-6 font-display text-5xl leading-[1.04] md:text-6xl">
              Heritage is not a moodboard. It is a responsibility.
            </h3>
            <p className="mt-8 max-w-xl leading-relaxed text-ivory/68">
              We do not want chikankari to become only a print, a trend, or a
              surface. We want the buyer to feel the time in it: the quiet
              luxury of human pace, the slight irregularity that proves the
              piece was touched, and the dignity of the artisan who made it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-28 lg:px-12 lg:py-36">
        <p className="small-caps text-center text-ink/45">A living inheritance</p>
        <h3 className="mx-auto mt-6 max-w-3xl text-center font-display text-5xl leading-[1.06] md:text-6xl">
          From courtly Awadh to contemporary wardrobes.
        </h3>
        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {timeline.map((item) => (
            <li key={item.year} className="border-t border-border pt-7">
              <span className="font-display text-4xl text-gold">{item.year}</span>
              <h4 className="mt-5 font-serif text-3xl text-ink">{item.title}</h4>
              <p className="mt-4 text-sm leading-relaxed text-ink/62">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        {editorial?.url && (
          <ParallaxImage
            src={editorial.url}
            alt={editorial.altText ?? 'ilham editorial chikankari'}
            className="aspect-[4/5]"
          />
        )}
        {editorialTwo?.url && (
          <div className="relative">
            <ParallaxImage
              src={editorialTwo.url}
              alt={editorialTwo.altText ?? 'ilham Lucknow atelier'}
              className="aspect-[4/5]"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/65 via-transparent to-transparent p-8 md:p-12">
              <p className="max-w-md font-serif text-3xl leading-snug text-ivory">
                Made slowly in Lucknow. Worn with ease across India.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

const ABOUT_VISUALS_QUERY = `#graphql
  query AboutVisuals($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafields(identifiers: [
        {namespace: "custom", key: "about_hero"},
        {namespace: "custom", key: "custom_about_hero"},
        {namespace: "custom", key: "about_hero_mobile"},
        {namespace: "custom", key: "custom_about_hero_mobile"},
        {namespace: "custom", key: "about_artisan"},
        {namespace: "custom", key: "custom_about_artisan"},
        {namespace: "custom", key: "about_fabric"},
        {namespace: "custom", key: "custom_about_fabric"},
        {namespace: "custom", key: "about_editorial_1"},
        {namespace: "custom", key: "custom_about_editorial_1"},
        {namespace: "custom", key: "about_editorial_2"},
        {namespace: "custom", key: "custom_about_editorial_2"}
      ]) {
        key
        namespace
        value
        type
        reference {
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
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
