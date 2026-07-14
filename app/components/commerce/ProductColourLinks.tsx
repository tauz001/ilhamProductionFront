import {Link} from 'react-router';
import {ProductColourSwatch} from './ProductColourSwatch';

export type ProductColourLink = {
  current?: boolean;
  handle: string;
  hex?: string | null;
  label: string;
  soldOut?: boolean;
  title: string;
};

export function ProductColourLinks({
  options,
}: {
  options: ProductColourLink[];
}) {
  if (options.length <= 1) return null;

  const currentOption = options.find((option) => option.current);

  return (
    <section className="mt-4" aria-labelledby="product-colour-options">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p id="product-colour-options" className="small-caps text-ink/50">
            Colour
          </p>
          {currentOption?.label && (
            <p className="mt-1 text-xs text-ink/50">
              Viewing {currentOption.label}
            </p>
          )}
        </div>
        <p className="hidden text-right text-[0.68rem] italic text-ink/40 sm:block">
          Each shade opens its own listing
        </p>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {options.map((option) => {
          const content = (
            <>
              <ProductColourSwatch
                hex={option.hex}
                label={option.label}
                selected={option.current}
              />
              <span className="truncate">{option.label}</span>
              {option.soldOut && (
                <span className="ml-auto shrink-0 text-[0.6rem] italic text-ink/35">
                  Sold out
                </span>
              )}
            </>
          );
          const className = [
            'flex h-10 min-w-[7.75rem] items-center gap-2 border px-3 text-left text-xs transition-colors',
            option.current
              ? 'border-ink bg-ink text-ivory'
              : 'border-border bg-ivory/30 text-ink hover:border-ink hover:bg-ivory',
            option.soldOut && !option.current ? 'text-ink/45' : '',
          ]
            .filter(Boolean)
            .join(' ');

          if (option.current) {
            return (
              <span
                key={option.handle}
                aria-current="page"
                className={className}
                title={option.title}
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={option.handle}
              prefetch="intent"
              to={`/products/${option.handle}`}
              className={className}
              title={option.title}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
