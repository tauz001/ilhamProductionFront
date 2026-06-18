import {useState} from 'react';
import {data, Form, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/contact';
import {
  ChevronDown,
  ExternalLink,
  Facebook,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import {FadeUp} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {AnimatePresence, motion} from 'framer-motion';
import {easeSilk} from '~/lib/motion/variants';
import {logMissingShopifyField} from '~/lib/commerce/shopify-fields';
import {SOCIAL_LINKS} from '~/lib/social-links';
import {canonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Contact - ilham'},
    {
      name: 'description',
      content: 'Reach the ilham atelier.',
    },
    {tagName: 'link', rel: 'canonical', href: canonicalUrl('/contact')},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const result = await context.storefront.query(CONTACT_QUERY);
  const page = result.page;

  if (!page?.body) {
    logMissingShopifyField(
      'contact',
      'page(handle: "contact")',
      'Create a Shopify page with handle "contact" and publish it to the Hydrogen sales channel. Put address, email, and atelier details in that page.',
    );
  }

  return {
    page,
    shop: result.shop,
  };
}

export async function action({request}: Route.ActionArgs) {
  await request.formData();
  console.warn(
    'Missing Shopify field: contact form endpoint. Configure Shopify Forms, a CRM app, or an Oxygen-safe email endpoint before sending customer messages.',
  );
  return data({submitted: true, delivered: false});
}

export default function Contact() {
  const {page, shop} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    {
      q: 'Do you ship across India?',
      a: 'All India delivery options and rates are confirmed at checkout before payment.',
    },
    {
      q: 'How long does an order take to make?',
      a: 'Lead times vary by piece, and made-to-order details appear on each product page.',
    },
    {
      q: 'Can I customise?',
      a: 'Yes. Share the occasion, colour story, and measurements, and the atelier will respond with possibilities.',
    },
    {
      q: 'Are returns possible?',
      a: 'Return eligibility depends on the piece and destination; the current terms are confirmed before checkout.',
    },
  ];

  return (
    <div className="pt-32 md:pt-44">
      <header className="mx-auto max-w-3xl px-6 text-center">
        <p className="small-caps text-ink/50">Be in touch</p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl">Hello.</h1>
        <p className="mt-6 text-ink/65 leading-relaxed">
          {shop?.description || shop?.name || 'ilham'}
        </p>
        <ChikanMotif className="mx-auto mt-10 h-6 w-40 text-gold" />
      </header>

      <section className="mx-auto max-w-[1200px] grid grid-cols-1 gap-16 px-6 py-24 md:grid-cols-5 md:gap-24">
        <Form method="post" className="md:col-span-3 space-y-8">
          {[
            {id: 'name', label: 'Your name', type: 'text'},
            {id: 'email', label: 'Email', type: 'email'},
            {id: 'subject', label: 'Subject', type: 'text'},
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="small-caps text-ink/50 block">
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                className="mt-2 w-full border-b border-border bg-transparent py-3 text-lg focus:border-ink focus:outline-none transition-colors"
              />
            </div>
          ))}
          <div>
            <label htmlFor="msg" className="small-caps text-ink/50 block">
              Your message
            </label>
            <textarea
              id="msg"
              name="message"
              rows={5}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-lg focus:border-ink focus:outline-none resize-none"
            />
          </div>
          <button className="small-caps border border-ink px-10 py-4 hover:bg-ink hover:text-ivory transition-colors">
            Send your note
          </button>
          {actionData?.submitted && (
            <p className="text-sm italic text-ink/55">
              Your note could not be sent from this page yet. Please use the
              atelier details beside this form.
            </p>
          )}
        </Form>

        <aside className="md:col-span-2 space-y-10">
          <FadeUp>
            <p className="small-caps text-ink/50">Atelier</p>
            {page?.body ? (
              <div
                className="mt-3 font-serif text-xl italic"
                dangerouslySetInnerHTML={{__html: page.body}}
              />
            ) : (
              <p className="mt-3 font-serif text-xl italic">{shop?.name}</p>
            )}
          </FadeUp>

          <div className="space-y-4">
            <p className="small-caps text-ink/50">Social</p>
            <a
              href={shop?.primaryDomain?.url ?? '#'}
              className="flex items-center gap-4 group"
            >
              <MessageCircle className="h-5 w-5 text-gold" strokeWidth={1.2} />
              <span className="story-link">Visit the storefront</span>
            </a>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 group"
              >
                <ContactSocialIcon label={social.label} />
                <span className="story-link">{social.label}</span>
              </a>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-t border-border bg-cream/50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="small-caps text-ink/50 text-center">Frequently asked</p>
          <h2 className="mt-6 text-center font-display text-5xl">
            Questions, gently answered.
          </h2>
          <div className="mt-16 border-t border-border">
            {faqs.map((faq, index) => (
              <div key={faq.q} className="border-b border-border">
                <button
                  className="flex w-full items-center justify-between py-7 text-left"
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <span className="font-serif text-2xl">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-500 ${
                      open === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {open === index && (
                    <motion.p
                      initial={{height: 0, opacity: 0}}
                      animate={{height: 'auto', opacity: 1}}
                      exit={{height: 0, opacity: 0}}
                      transition={{duration: 0.6, ease: easeSilk}}
                      className="pb-7 text-ink/65 leading-relaxed overflow-hidden"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactSocialIcon({label}: {label: string}) {
  if (label === 'Instagram') {
    return <Instagram className="h-5 w-5 text-gold" strokeWidth={1.2} />;
  }

  if (label === 'Facebook') {
    return <Facebook className="h-5 w-5 text-gold" strokeWidth={1.2} />;
  }

  return <ExternalLink className="h-5 w-5 text-gold" strokeWidth={1.2} />;
}

const CONTACT_QUERY = `#graphql
  query ContactPage($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    page(handle: "contact") {
      id
      title
      body
      bodySummary
    }
  }
` as const;
