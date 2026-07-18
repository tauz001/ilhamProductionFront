import {useRef, type ReactNode} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {ProductCard} from './ProductCard';
import {
  expandColourVariantListings,
  getProductListingKey,
} from '~/lib/commerce/colour-listings';

type Props = {
  products: any[];
  labelledBy: string;
};

export function ProductRail({products, labelledBy}: Props) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const listings = expandColourVariantListings(products);

  const scroll = (direction: 'left' | 'right') => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction === 'left' ? -rail.clientWidth * 0.82 : rail.clientWidth * 0.82,
      behavior: 'smooth',
    });
  };

  if (!listings.length) return null;

  return (
    <div className="relative">
      <div
        ref={railRef}
        role="list"
        aria-labelledby={labelledBy}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-6 md:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((product) => (
          <div
            key={getProductListingKey(product)}
            role="listitem"
            className="w-[72vw] max-w-[320px] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[24vw]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {listings.length > 2 ? (
        <div className="pointer-events-none absolute inset-x-1 top-[40%] z-20 flex -translate-y-1/2 justify-between sm:-inset-x-4 lg:-inset-x-5">
          <RailButton label="Scroll products left" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.2} />
          </RailButton>
          <RailButton label="Scroll products right" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" strokeWidth={1.2} />
          </RailButton>
        </div>
      ) : null}
    </div>
  );
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto grid h-10 w-10 place-items-center border border-border bg-ivory/95 text-ink/70 shadow-[0_8px_24px_rgba(55,43,27,0.12)] backdrop-blur-sm transition-colors hover:border-ink hover:bg-ink hover:text-ivory sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}
