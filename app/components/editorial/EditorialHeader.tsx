import type {ReactNode} from 'react';

type EditorialHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  compact?: boolean;
};

export function EditorialHeader({
  eyebrow,
  title,
  intro,
  compact = false,
}: EditorialHeaderProps) {
  return (
    <header
      className={`mx-auto max-w-[1500px] px-6 text-center lg:px-12 ${
        compact ? 'pb-12 pt-32 md:pb-16 md:pt-40' : 'pb-16 pt-32 md:pb-24 md:pt-44'
      }`}
    >
      <p className="small-caps text-ink/50">{eyebrow}</p>
      <h1 className="mx-auto mt-5 max-w-5xl text-balance font-display text-5xl leading-[0.98] sm:text-6xl md:mt-7 md:text-8xl">
        {title}
      </h1>
      {intro ? (
        <p className="mx-auto mt-6 max-w-2xl text-pretty font-serif text-lg leading-relaxed text-ink/65 md:mt-8 md:text-xl">
          {intro}
        </p>
      ) : null}
      <span
        aria-hidden
        className="mx-auto mt-8 block h-px w-12 bg-gold/70 md:mt-10"
      />
    </header>
  );
}
