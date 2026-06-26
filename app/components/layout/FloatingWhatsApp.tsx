import {MessageCircle} from 'lucide-react';

type Props = {
  href?: string;
};

export function FloatingWhatsApp({href}: Props) {
  const targetHref = href?.trim() || '/contact';
  const external = /^https?:\/\//.test(targetHref);

  return (
    <div className="whatsapp-float fixed bottom-5 right-5 z-40 flex items-center gap-3 md:bottom-7 md:right-7">
      <span
        id="whatsapp-trust-tooltip"
        className="pointer-events-none max-w-[9.5rem] border border-gold/25 bg-ivory/95 px-3 py-2 text-left shadow-soft transition-colors duration-[var(--motion-feedback)] md:max-w-[13rem] md:bg-ivory/90 md:backdrop-blur"
      >
        <span className="block text-[9px] font-medium uppercase tracking-[0.24em] text-ink/60">
          Need size help?
        </span>
        <span className="mt-1 hidden text-xs leading-snug text-ink/65 sm:block">
          Chat for fit, delivery or styling guidance.
        </span>
      </span>

      <a
        href={targetHref}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        aria-label="Chat with ilham on WhatsApp for size, delivery or styling guidance"
        aria-describedby="whatsapp-trust-tooltip"
        className="group/whatsapp relative isolate grid h-[3.25rem] w-[3.25rem] place-items-center border border-gold/50 bg-ivory text-ink shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-ink hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:bg-ivory/90 md:backdrop-blur"
      >
        <span
          className="whatsapp-pulse pointer-events-none absolute inset-0 -z-10 border border-gold/35 bg-gold/20"
          aria-hidden
        />
        <span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-ivory bg-gold shadow-[0_0_0_3px_rgba(190,145,78,0.18)]"
          aria-hidden
        />
        <MessageCircle
          className="h-5 w-5 transition-transform duration-[var(--motion-feedback)] group-hover/whatsapp:scale-105"
          strokeWidth={1.4}
        />
      </a>
    </div>
  );
}
