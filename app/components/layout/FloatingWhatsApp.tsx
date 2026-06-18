import {MessageCircle} from 'lucide-react';

type Props = {
  href?: string;
};

export function FloatingWhatsApp({href}: Props) {
  const targetHref = href?.trim() || '/contact';
  const external = /^https?:\/\//.test(targetHref);

  return (
    <a
      href={targetHref}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-label="Chat with ilham on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-[3.25rem] w-[3.25rem] place-items-center border border-gold/50 bg-ivory/90 text-ink shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-ink hover:text-ivory md:bottom-7 md:right-7"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.4} />
    </a>
  );
}
