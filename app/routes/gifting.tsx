import type {Route} from './+types/gifting';
import {Link, useLoaderData} from 'react-router';
import {useMemo, useState} from 'react';
import {Check} from 'lucide-react';
import {ParallaxImage} from '~/components/editorial/ParallaxImage';
import {FadeUp, MaskedReveal} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {logMissingShopifyField} from '~/lib/commerce/shopify-fields';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Luxury Gifting - ilham'},
    {
      name: 'description',
      content:
        'Gift Lucknowi chikankari worldwide. Hand-bound boxes, handwritten notes, occasion curation.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(GIFTING_COLLECTIONS_QUERY);
  const nodes = collections.nodes ?? [];

  ['luxury-gifting', 'wedding-edit', 'men', 'women'].forEach((handle) => {
    const collection = nodes.find((item: any) => item.handle === handle);
    if (!collection?.image?.url) {
      logMissingShopifyField(
        `collection:${handle}`,
        'collection.image',
        `Create/publish collection "${handle}" with an image in Shopify Admin so the gifting page can match the TanStack visual layout.`,
      );
    }
  });

  return {collections: nodes};
}

export default function Gifting() {
  const {collections} = useLoaderData<typeof loader>();
  const [occasion, setOccasion] = useState('Wedding');
  const [packaging, setPackaging] = useState('Signature');
  const [note, setNote] = useState('');

  const occasions = useMemo(
    () => ['Wedding', 'Birthday', 'Anniversary', 'Festive', 'Corporate', 'Just because'],
    [],
  );
  const packagings = useMemo(
    () => [
      {name: 'Signature', desc: 'Hand-bound ivory box, gold ribbon, dried rose.'},
      {name: 'Heirloom', desc: 'Wooden inlay trunk, muslin wrap, calligraphy seal.'},
      {name: 'Atelier', desc: 'Minimalist linen sleeve, hand-stamped wax.'},
    ],
    [],
  );

  const giftingHero =
    collections.find((c: any) => c.handle === 'luxury-gifting')?.image?.url ??
    collections[0]?.image?.url ??
    '';
  const wedding =
    collections.find((c: any) => c.handle === 'wedding-edit')?.image?.url ??
    giftingHero;
  const men =
    collections.find((c: any) => c.handle === 'men')?.image?.url ?? giftingHero;
  const women =
    collections.find((c: any) => c.handle === 'women')?.image?.url ?? giftingHero;

  const flows = useMemo(
    () => [
      {
        title: 'Wedding Gifting',
        img: wedding,
        blurb:
          'For the witness, the maid of honour, the mother. Curated trousseaux from ten pieces upward.',
      },
      {
        title: 'Corporate Gifting',
        img: giftingHero,
        blurb:
          'For Diwali, milestones, board appointments. Custom embroidery on the inner placket.',
      },
      {
        title: 'For Her',
        img: women,
        blurb:
          'Sarees, anarkalis, dupattas — for the women whose presence is already gift enough.',
      },
      {
        title: 'For Him',
        img: men,
        blurb: 'Kurtas and pathani sets for the men of restraint and ritual.',
      },
    ],
    [giftingHero, men, wedding, women],
  );

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        <ParallaxImage
          src={giftingHero}
          alt="ilham gifting"
          className="absolute inset-0"
          imgClassName="brightness-[0.78]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center text-ivory px-6">
          <p className="small-caps text-ivory/70">Luxury Gifting</p>
          <h1 className="mt-6 font-display text-6xl md:text-[8vw] leading-[0.95]">
            <MaskedReveal>Gift Lucknowi elegance,</MaskedReveal>
            <br />
            <MaskedReveal delay={0.2}>
              <em className="italic font-serif">anywhere in the world.</em>
            </MaskedReveal>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="small-caps text-ink/50">A slow ritual of arrival</p>
        <h2 className="mt-8 font-display text-4xl md:text-5xl text-balance">
          Hand-bound boxes. Handwritten notes. The unhurried opening of something made by hand.
        </h2>
        <ChikanMotif className="mx-auto mt-10 h-6 w-40 text-gold" />
      </section>

      <section className="mx-auto max-w-[1500px] grid grid-cols-1 gap-0 px-0 md:grid-cols-2 border-y border-border">
        {flows.map((f, i) => (
          <FadeUp
            key={f.title}
            delay={(i % 2) * 0.1}
            className={`group relative overflow-hidden ${i % 2 === 1 ? 'md:border-l' : ''} ${i >= 2 ? 'border-t' : ''} border-border`}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={f.img}
                alt={f.title}
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <div className="p-8 md:p-12">
              <h3 className="font-display text-4xl md:text-5xl">{f.title}</h3>
              <p className="mt-4 text-ink/65 leading-relaxed">{f.blurb}</p>
              <Link to="/collections" className="mt-6 inline-block small-caps story-link">
                Begin curation →
              </Link>
            </div>
          </FadeUp>
        ))}
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
        <p className="small-caps text-ink/50 text-center">Compose your gift</p>
        <h2 className="mt-6 text-center font-display text-5xl md:text-6xl">
          A small atelier ritual.
        </h2>

        <div className="mt-20 grid gap-16 md:grid-cols-2">
          <ParallaxImage src={giftingHero} alt="" className="aspect-[4/5]" />

          <div className="space-y-12">
            <div>
              <p className="small-caps text-ink/50">Occasion</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`px-5 py-2.5 small-caps border transition-colors ${
                      occasion === o
                        ? 'bg-ink text-ivory border-ink'
                        : 'border-border hover:border-ink'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="small-caps text-ink/50">Packaging</p>
              <div className="mt-4 space-y-3">
                {packagings.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPackaging(p.name)}
                    className={`w-full text-left border p-5 transition-colors flex items-start gap-4 ${
                      packaging === p.name
                        ? 'border-ink bg-cream'
                        : 'border-border hover:border-ink'
                    }`}
                  >
                    <span
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                        packaging === p.name
                          ? 'bg-gold border-gold text-ivory'
                          : 'border-ink/30'
                      }`}
                    >
                      {packaging === p.name && <Check className="h-3 w-3" />}
                    </span>
                    <span>
                      <span className="font-serif text-xl block">{p.name}</span>
                      <span className="text-sm text-ink/60">{p.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="small-caps text-ink/50">Handwritten note</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={240}
                rows={4}
                placeholder="A word, a line, a memory. We will write it in iron-gall ink…"
                className="mt-4 w-full bg-cream/60 border border-border p-5 font-serif text-lg italic focus:outline-none focus:border-ink"
              />
              <p className="mt-2 text-xs text-ink/40">
                {note.length} / 240
              </p>
            </div>

            <Link
              to="/collections"
              className="small-caps inline-block border border-ink px-10 py-4 hover:bg-ink hover:text-ivory transition-colors"
            >
              Choose the piece →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const GIFTING_COLLECTIONS_QUERY = `#graphql
  query GiftingCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 30) {
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
      }
    }
  }
` as const;

