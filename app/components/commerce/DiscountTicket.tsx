import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Check, Copy, Ticket} from 'lucide-react';
import type {DiscountTicketOffer} from '~/lib/commerce/discount-ticket';

type Props = {
  applied?: boolean;
  className?: string;
  offer?: DiscountTicketOffer | null;
  redirectTo: string;
  tone?: 'dark' | 'light';
};

export function DiscountTicket({
  applied = false,
  className = '',
  offer,
  redirectTo,
  tone = 'light',
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const applyPath = useMemo(() => {
    if (!offer?.code) return '#';
    return `/discount/${encodeURIComponent(offer.code)}?redirect=${encodeURIComponent(
      redirectTo,
    )}`;
  }, [offer?.code, redirectTo]);

  if (!offer?.code) return null;

  const dark = tone === 'dark';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className={`relative overflow-hidden border ${
        dark
          ? 'border-ivory/20 bg-ivory/[0.06] text-ivory'
          : 'border-gold/35 bg-[linear-gradient(135deg,#fffaf0,#f5ead8)] text-ink shadow-[0_20px_50px_-36px_rgba(80,48,18,0.55)]'
      } ${className}`}
      aria-label={`Discount code ${offer.code}`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          dark ? 'bg-ink' : 'bg-ivory'
        }`}
      />
      <span
        aria-hidden
        className={`absolute right-0 top-1/2 h-8 w-8 translate-x-1/2 -translate-y-1/2 rounded-full ${
          dark ? 'bg-ink' : 'bg-ivory'
        }`}
      />
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className={`small-caps ${dark ? 'text-ivory/50' : 'text-ink/45'}`}>
            Atelier ticket
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Ticket
              className={dark ? 'h-4 w-4 text-gold-soft' : 'h-4 w-4 text-gold'}
              strokeWidth={1.3}
            />
            <code
              className={`break-all font-serif text-2xl tracking-[0.08em] ${
                dark ? 'text-ivory' : 'text-ink'
              }`}
            >
              {offer.code}
            </code>
          </div>
          <p
            className={`mt-2 text-xs leading-relaxed ${
              dark ? 'text-ivory/58' : 'text-ink/58'
            }`}
          >
            {offer.summary}
            {offer.endsAt ? ` Ends ${formatOfferDate(offer.endsAt)}.` : ''}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:w-36">
          <button
            type="button"
            onClick={() => void copyCode()}
            className={`flex h-11 items-center justify-center gap-2 border small-caps text-[10px] transition-colors ${
              dark
                ? 'border-ivory/20 hover:border-gold hover:text-gold-soft'
                : 'border-ink/15 bg-ivory/70 hover:border-gold hover:text-gold'
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <Link
            to={applyPath}
            className={`flex h-11 items-center justify-center small-caps text-[10px] transition-colors ${
              applied
                ? 'bg-gold/20 text-gold'
                : dark
                  ? 'bg-ivory text-ink hover:bg-gold hover:text-ivory'
                  : 'bg-ink text-ivory hover:bg-gold'
            }`}
          >
            {applied ? 'Applied' : 'Apply to bag'}
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatOfferDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
