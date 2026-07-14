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
        <div className="mt-5 flex justify-end gap-2">
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
      className="grid h-11 w-11 place-items-center border border-border text-ink/65 transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}
