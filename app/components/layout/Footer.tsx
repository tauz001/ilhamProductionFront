import {Link} from 'react-router';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {SOCIAL_LINKS} from '~/lib/social-links';

const LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/ilham_logo_wo_bg.png?v=1780461025';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <span
        aria-hidden
        className="font-urdu pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 select-none text-[42vh] leading-none text-[oklch(0.62_0.11_75)]/[0.04]"
      >
        الہام
      </span>
      <div className="relative mx-auto max-w-[1500px] px-6 py-24 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="ilham home">
            <img
              src={LOGO_URL}
              alt="ilham"
              className="h-11 w-auto object-contain invert"
              loading="lazy"
            />
          </Link>
          <ChikanMotif className="mt-8 h-8 w-48 text-gold-soft" />
          <h2 className="mt-10 font-display text-5xl tracking-[0.04em] md:text-7xl">
            Every thread <em className="italic font-serif">carries</em> a story.
          </h2>
          <p className="mt-6 max-w-xl text-ivory/60 leading-relaxed">
            Be the first to receive new editions, atelier notes and unhurried
            letters from Lucknow.
          </p>
          <form
            className="mt-10 flex w-full max-w-md items-center border-b border-ivory/30 pb-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent text-ivory placeholder:text-ivory/40 focus:outline-none py-2"
            />
            <button className="small-caps text-gold-soft hover:text-gold">
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-12 border-t border-ivory/15 pt-16 md:grid-cols-4">
          <div>
            <p className="small-caps text-ivory/40">Atelier</p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/80">
              <li>
                <Link to="/about" className="hover:text-gold">
                  Our heritage
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold">
                  The artisans
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold">
                  The process
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="small-caps text-ivory/40">Shop</p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/80">
              <li>
                <Link to="/collections" className="hover:text-gold">
                  All collections
                </Link>
              </li>
              <li>
                <Link to="/collections/wedding-edit" className="hover:text-gold">
                  Wedding edit
                </Link>
              </li>
              <li>
                <Link to="/collections/new-arrivals" className="hover:text-gold">
                  New arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="small-caps text-ivory/40">Gifting</p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/80">
              <li>
                <Link to="/gifting" className="hover:text-gold">
                  Luxury gifting
                </Link>
              </li>
              <li>
                <Link to="/gifting" className="hover:text-gold">
                  Wedding gifting
                </Link>
              </li>
              <li>
                <Link to="/gifting" className="hover:text-gold">
                  Corporate gifting
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="small-caps text-ivory/40">Visit</p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/80">
              <li>
                <Link to="/contact" className="hover:text-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping-policy" className="hover:text-gold">
                  All India shipping
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-gold">
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold">
                  Care & repair
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ivory/15 pt-8 text-xs text-ivory/40 md:flex-row">
          <p>
            © {new Date().getFullYear()} ilham Atelier — Lucknow, India. Made by
            hand.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold"
              >
                {social.label}
              </a>
            ))}
            <Link to="/terms-and-conditions" className="hover:text-gold">
              Terms
            </Link>
            <Link to="/blogs" className="hover:text-gold">
              Journal
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ivory/35">
          Developed by{' '}
          <a
            href="https://tauz001.github.io/PortfolioTauz/"
            target="_blank"
            rel="noreferrer"
            className="text-ivory/55 transition-colors hover:text-gold"
          >
            Love
          </a>
        </p>
      </div>
    </footer>
  );
}

