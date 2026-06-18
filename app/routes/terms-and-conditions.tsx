import type {Route} from './+types/terms-and-conditions';
import {Link} from 'react-router';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {canonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Terms and Conditions - ilham'},
    {
      name: 'description',
      content:
        'Terms and conditions for shopping handcrafted Lucknowi chikankari from ilham.',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: canonicalUrl('/terms-and-conditions'),
    },
  ];
};

const sections = [
  {
    title: 'Handcrafted Pieces',
    body: 'Each ilham piece is made or finished by hand. Small variations in stitch density, motif placement, colour tone, and texture are natural to chikankari and are part of the character of the work.',
  },
  {
    title: 'Orders and Availability',
    body: 'Orders are confirmed only after successful checkout. If a piece becomes unavailable after purchase, we will contact you with the closest possible replacement, exchange option, or cancellation support.',
  },
  {
    title: 'Pricing and Payment',
    body: 'Prices are shown in Indian rupees unless stated otherwise. Taxes, shipping, and payment method availability are calculated at checkout by Shopify and the active payment providers.',
  },
  {
    title: 'Shipping Across India',
    body: 'We ship across India. Delivery estimates shown on the site are guidance only and can change because of courier capacity, holidays, address serviceability, weather, or local restrictions.',
  },
  {
    title: 'Returns and Exchanges',
    body: 'Eligible pieces can be returned or exchanged within 14 days of delivery when they are unused, unworn, unwashed, and returned with original packaging and tags. Custom, altered, final sale, or hygiene-sensitive pieces may not be eligible.',
  },
  {
    title: 'Gifting Orders',
    body: 'Gift notes, occasions, and packaging selections are carried with the order details. Paid gift services, when selected, are added as a separate line item at checkout.',
  },
  {
    title: 'Product Care',
    body: 'Chikankari is delicate handwork. Please follow the care instructions shared with the product. Damage caused by incorrect washing, ironing, storage, or handling is not treated as a product defect.',
  },
  {
    title: 'Website Use',
    body: 'Images, copy, motifs, layouts, and brand materials on this site belong to ilham or its licensors. They may not be copied, reused, or reproduced for commercial use without written permission.',
  },
];

export default function TermsAndConditions() {
  return (
    <div className="bg-ivory pt-28 text-ink md:pt-36">
      <section className="mx-auto max-w-[1100px] px-6 pb-20 pt-12 text-center lg:px-12">
        <p className="small-caps text-ink/45">Atelier terms</p>
        <h1 className="mt-6 font-display text-5xl leading-[0.98] md:text-7xl">
          Terms and Conditions
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-ink/60 md:text-base">
          These terms keep the buying experience clear, respectful, and aligned
          with the slow nature of handmade chikankari.
        </p>
        <ChikanMotif className="mx-auto mt-10 h-6 w-44 text-gold" />
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-28 lg:px-12">
        <div className="border-y border-border">
          {sections.map((section) => (
            <article
              key={section.title}
              className="grid gap-5 border-b border-border py-8 last:border-b-0 md:grid-cols-[0.42fr_1fr] md:py-10"
            >
              <h2 className="font-serif text-2xl leading-tight">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-ink/62 md:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 border border-border bg-cream/45 p-6 md:p-8">
          <p className="small-caps text-ink/45">Need help?</p>
          <p className="mt-3 max-w-2xl font-serif text-2xl leading-snug text-ink">
            For order questions, gifting requests, exchanges, or care guidance,
            contact the atelier before placing or returning an order.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex min-h-12 items-center border border-ink px-8 small-caps text-[10px] transition-colors hover:bg-ink hover:text-ivory"
          >
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
