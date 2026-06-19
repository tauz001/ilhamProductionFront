import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
  type ShouldRevalidateFunction,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Check, ChevronDown, SlidersHorizontal, X} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {Analytics} from '@shopify/hydrogen';
import {ProductCard} from '~/components/commerce/ProductCard';
import {FadeUp} from '~/components/editorial/MaskedReveal';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  getMetafieldValue,
  logMissingShopifyField,
  parseListField,
  tagIncludes,
} from '~/lib/commerce/shopify-fields';
import {
  clearCollectionFilters,
  PRICE_BANDS,
  parseCollectionFilters,
  getCollectionSearchTerm,
  getCollectionSort,
  setCollectionSearchTerm,
  setCollectionSort,
  toggleCollectionFilterValue,
  type CollectionFilterKey,
  type CollectionFilterState,
} from '~/lib/commerce/collection-filters';
import {productMatchesText} from '~/lib/commerce/product-facets';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {breadcrumbJsonLd, canonicalUrl, collectionItemListJsonLd} from '~/lib/seo';

const COLLECTION_PAGE_SIZE = 24;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  defaultShouldRevalidate,
  formMethod,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
};

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  return [
    {title: collection ? `${collection.title} - ilham` : 'Collection - ilham'},
    {
      name: 'description',
      content: collection?.description ?? 'ilham collection',
    },
    {
      property: 'og:title',
      content: collection ? `${collection.title} - ilham` : 'ilham',
    },
    {property: 'og:image', content: collection?.image?.url},
    {
      tagName: 'link',
      rel: 'canonical',
      href: collection
        ? canonicalUrl(`/collections/${collection.handle}`)
        : canonicalUrl('/collections'),
    },
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const cursor = new URL(request.url).searchParams.get('cursor');
  const paginationVariables = {
    after: cursor || null,
    first: COLLECTION_PAGE_SIZE,
  };

  if (!handle) {
    throw new Response(null, {status: 404});
  }

  if (handle === 'new-arrivals') {
    const {products} = await storefront.query(NEW_ARRIVALS_QUERY, {
      cache: storefront.CacheShort(),
      variables: paginationVariables,
    });
    const collection = createNewArrivalsCollection(
      (products?.nodes ?? []).filter(isNewProduct),
      products?.pageInfo,
    );

    logCollectionRequirements(collection);

    return {collection};
  }

  if (handle === 'best-sellers') {
    const {products} = await storefront.query(BEST_SELLERS_QUERY, {
      cache: storefront.CacheShort(),
      variables: paginationVariables,
    });
    const bestSellers = (products?.nodes ?? []).filter(isBestSellerProduct);
    const collection = createBestSellersCollection(
      bestSellers.length ? bestSellers : (products?.nodes ?? []),
      products?.pageInfo,
    );

    logCollectionRequirements(collection);

    return {collection};
  }

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    cache: storefront.CacheShort(),
    variables: {handle, ...paginationVariables},
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});
  logCollectionRequirements(collection);

  return {collection};
}

type FilterState = CollectionFilterState;

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialItems = useMemo(
    () => collection.products?.nodes ?? [],
    [collection.products?.nodes],
  );
  const [baseItems, setBaseItems] = useState<any[]>(initialItems);
  const [pageInfo, setPageInfo] = useState(collection.products?.pageInfo);

  useEffect(() => {
    setBaseItems(initialItems);
    setPageInfo(collection.products?.pageInfo);
  }, [collection.handle, collection.products?.pageInfo, initialItems]);

  useEffect(() => {
    const nextCollection = fetcher.data?.collection;
    if (!nextCollection || nextCollection.handle !== collection.handle) return;

    setBaseItems((current) => {
      const knownHandles = new Set(current.map((product) => product.handle));
      const nextItems = (nextCollection.products?.nodes ?? []).filter(
        (product: any) => !knownHandles.has(product.handle),
      );
      return nextItems.length ? [...current, ...nextItems] : current;
    });
    setPageInfo(nextCollection.products?.pageInfo);
  }, [collection.handle, fetcher.data]);

  const loadMore = () => {
    if (
      fetcher.state !== 'idle' ||
      !pageInfo?.hasNextPage ||
      !pageInfo.endCursor
    ) {
      return;
    }

    void fetcher.load(
      `/collections/${collection.handle}?cursor=${encodeURIComponent(pageInfo.endCursor)}`,
    );
  };
  const tagline = getRequiredCollectionMetafield(collection, 'tagline');
  const category = getRequiredCollectionMetafield(collection, 'category');
  const filters = useMemo(
    () => parseCollectionFilters(searchParams),
    [searchParams],
  );
  const collectionQuery = getCollectionSearchTerm(searchParams);
  const sort = getCollectionSort(searchParams);

  const facets = useMemo(() => {
    const occasions = new Set<string>();
    const fabrics = new Set<string>();
    const sizes = new Set<string>();
    const colors = new Map<string, string | undefined>();

    baseItems.forEach((product: any) => {
      parseListField(getMetafieldValue(product, 'occasions')).forEach((occasion) =>
        occasions.add(occasion),
      );

      const fabric = getProductFabric(product);
      if (fabric) fabrics.add(fabric);

      const color = getProductColor(product);
      if (color.name) colors.set(color.name, color.hex ?? undefined);

      getProductOptionValues(product, 'size').forEach((size) => sizes.add(size));
    });

    return {
      occasions: [...occasions].sort(),
      fabrics: [...fabrics].sort(),
      sizes: [...sizes],
      colors: [...colors.entries()].map(([name, hex]) => ({name, hex})),
    };
  }, [baseItems]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const updateSearchParams = (next: URLSearchParams) => {
    setSearchParams(next, {preventScrollReset: true});
  };

  const toggle = (key: CollectionFilterKey, value: string) => {
    updateSearchParams(toggleCollectionFilterValue(searchParams, key, value));
  };

  const clearQuery = () => {
    updateSearchParams(setCollectionSearchTerm(searchParams, ''));
  };

  const clearAll = () => updateSearchParams(clearCollectionFilters(searchParams));

  const updateSort = (value: string) => {
    updateSearchParams(setCollectionSort(searchParams, value));
  };

  const filtered = useMemo(() => {
    return baseItems.filter((product: any) => {
      if (collectionQuery && !productMatchesText(product, collectionQuery)) {
        return false;
      }

      const productOccasions = parseListField(getMetafieldValue(product, 'occasions'));
      const fabric = getProductFabric(product);
      const color = getProductColor(product);
      const price = getProductPrice(product);

      if (
        filters.occasions.length &&
        !filters.occasions.some((occasion) => productOccasions.includes(occasion))
      ) {
        return false;
      }

      if (filters.fabrics.length && (!fabric || !filters.fabrics.includes(fabric))) {
        return false;
      }

      if (
        filters.colors.length &&
        (!color.name || !filters.colors.includes(color.name))
      ) {
        return false;
      }

      if (filters.priceBands.length) {
        const inBand = filters.priceBands.some((id) => {
          const band = PRICE_BANDS.find((item) => item.id === id);
          return band ? price >= band.min && price < band.max : false;
        });
        if (!inBand) return false;
      }

      if (filters.sizes.length) {
        const productSizes = getProductOptionValues(product, 'size');
        if (!filters.sizes.some((size) => productSizes.includes(size))) {
          return false;
        }
      }

      if (filters.availability.includes('in-stock')) {
        if (!product.availableForSale) {
          return false;
        }
      }

      return true;
    });
  }, [baseItems, collectionQuery, filters]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a: any, b: any) => {
        if (sort === 'price-asc') return getProductPrice(a) - getProductPrice(b);
        if (sort === 'price-desc') return getProductPrice(b) - getProductPrice(a);
        if (sort === 'new') {
          return Number(isNewProduct(b)) - Number(isNewProduct(a));
        }
        return 0;
      }),
    [filtered, sort],
  );

  const activeCount =
    filters.priceBands.length +
    filters.colors.length +
    filters.occasions.length +
    filters.fabrics.length +
    filters.sizes.length +
    filters.availability.length +
    (collectionQuery ? 1 : 0);

  const groups = [
    {key: 'priceBands' as const, label: 'Price', type: 'price' as const},
    {key: 'colors' as const, label: 'Color', type: 'color' as const},
    {
      key: 'occasions' as const,
      label: 'Occasion',
      type: 'list' as const,
      values: facets.occasions,
    },
    {key: 'fabrics' as const, label: 'Fabric', type: 'list' as const, values: facets.fabrics},
    {key: 'sizes' as const, label: 'Size', type: 'size' as const},
    {key: 'availability' as const, label: 'Availability', type: 'availability' as const},
  ];

  return (
    <>
      <header className="mx-auto max-w-[1500px] px-6 pt-36 pb-12 text-center lg:px-12 lg:pt-44">
        <p className="small-caps text-ink/50">{category} / The Atelier</p>
        <h1 className="mt-5 font-display text-5xl md:text-7xl tracking-[0.01em]">
          {collection.title}
        </h1>
        {tagline && (
          <p className="mx-auto mt-5 max-w-xl text-sm md:text-base italic text-ink/65">
            {tagline}
          </p>
        )}
        <ChikanMotif className="mx-auto mt-8 h-5 w-32 text-gold" />
      </header>

      <div className="sticky top-16 lg:top-20 z-30 border-y border-border bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-3.5 lg:px-12">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 small-caps text-ink/75 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.3} />
            Filters
            {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {groups.map((group) => (
              <FilterDropdown key={group.key} label={group.label} count={filters[group.key].length}>
                {group.type === 'price' && (
                  <CheckList
                    items={PRICE_BANDS.map((band) => ({value: band.id, label: band.label}))}
                    selected={filters.priceBands}
                    onToggle={(value) => toggle('priceBands', value)}
                  />
                )}
                {group.type === 'color' && (
                  <ColorList
                    items={facets.colors}
                    selected={filters.colors}
                    onToggle={(value) => toggle('colors', value)}
                  />
                )}
                {group.type === 'list' && (
                  <CheckList
                    items={(group.values ?? []).map((value) => ({value, label: value}))}
                    selected={filters[group.key]}
                    onToggle={(value) => toggle(group.key, value)}
                  />
                )}
                {group.type === 'size' && (
                  <SizeGrid
                    sizes={facets.sizes}
                    selected={filters.sizes}
                    onToggle={(value) => toggle('sizes', value)}
                  />
                )}
                {group.type === 'availability' && (
                  <CheckList
                    items={[{value: 'in-stock', label: 'In stock only'}]}
                    selected={filters.availability}
                    onToggle={(value) => toggle('availability', value)}
                  />
                )}
              </FilterDropdown>
            ))}
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="ml-3 small-caps text-xs text-gold hover:text-ink transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden md:inline small-caps text-xs text-ink/50">
              {sorted.length} {sorted.length === 1 ? 'piece' : 'pieces'}
            </span>
            <label className="flex items-center gap-2 small-caps text-ink/60">
              <span className="hidden sm:inline text-xs">Sort</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => updateSort(event.target.value)}
                  className="appearance-none border-b border-ink/25 bg-transparent pr-5 py-1 small-caps text-xs focus:outline-none focus:border-ink"
                >
                  <option value="featured">Featured</option>
                  <option value="new">New In</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
              </div>
            </label>
          </div>
        </div>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{height: 0, opacity: 0}}
              animate={{height: 'auto', opacity: 1}}
              exit={{height: 0, opacity: 0}}
              transition={{duration: 0.3, ease: [0.65, 0, 0.35, 1]}}
              className="overflow-hidden border-t border-border/60"
            >
              <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-6 py-3 lg:px-12">
                {collectionQuery && (
                  <button
                    onClick={clearQuery}
                    className="group flex items-center gap-1.5 border border-ink/15 bg-ivory/70 px-3 py-1 text-xs text-ink/80 transition-colors hover:border-ink/40"
                  >
                    Search: {collectionQuery}
                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </button>
                )}
                {(Object.keys(filters) as (keyof FilterState)[]).flatMap((key) =>
                  filters[key].map((value) => {
                    const label =
                      key === 'priceBands'
                        ? PRICE_BANDS.find((band) => band.id === value)?.label ?? value
                        : key === 'availability'
                          ? 'In stock'
                          : value;
                    return (
                      <button
                        key={`${key}-${value}`}
                        onClick={() => toggle(key, value)}
                        className="group flex items-center gap-1.5 border border-ink/15 bg-ivory/70 px-3 py-1 text-xs text-ink/80 hover:border-ink/40 transition-colors"
                      >
                        {label}
                        <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                      </button>
                    );
                  }),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20">
        {sorted.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="font-serif text-2xl italic text-ink/70">No pieces match these filters.</p>
            <button onClick={clearAll} className="small-caps story-link text-gold">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {sorted.map((product: any, index: number) => (
              <FadeUp key={product.handle}>
                <ProductCard product={product} priority={index < 4} />
              </FadeUp>
            ))}
          </div>
        )}
        {pageInfo?.hasNextPage ? (
          <div className="mt-14 flex flex-col items-center gap-5">
            {fetcher.state !== 'idle' ? (
              <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4" aria-hidden>
                {Array.from({length: 4}, (_, index) => (
                  <div key={index} className="aspect-[3/4] skeleton-luxury" />
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={loadMore}
              disabled={fetcher.state !== 'idle'}
              className="min-h-12 border border-ink px-9 small-caps text-ink transition-colors hover:bg-ink hover:text-ivory disabled:cursor-wait disabled:opacity-45"
            >
              {fetcher.state === 'idle' ? 'Load more pieces' : 'Loading pieces'}
            </button>
          </div>
        ) : null}
      </section>

      <MobileFilters
        activeCount={activeCount}
        clearAll={clearAll}
        facets={facets}
        filters={filters}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sortedLength={sorted.length}
        toggle={toggle}
      />

      <section className="border-t border-border py-16 text-center">
        <p className="small-caps text-ink/50">Continue exploring</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link to="/collections" className="small-caps story-link">
            All collections
          </Link>
          <span className="text-ink/30">/</span>
          <Link to="/gifting" className="small-caps story-link">
            Gifting
          </Link>
          <span className="text-ink/30">/</span>
          <Link to="/about" className="small-caps story-link">
            Our heritage
          </Link>
        </div>
      </section>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
      <JsonLd data={collectionItemListJsonLd(collection, sorted)} />
      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', url: '/'},
          {name: collection.title, url: `/collections/${collection.handle}`},
        ])}
      />
    </>
  );
}

function MobileFilters({
  activeCount,
  clearAll,
  facets,
  filters,
  mobileOpen,
  setMobileOpen,
  sortedLength,
  toggle,
}: {
  activeCount: number;
  clearAll: () => void;
  facets: {
    occasions: string[];
    fabrics: string[];
    sizes: string[];
    colors: {name: string; hex?: string}[];
  };
  filters: FilterState;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  sortedLength: number;
  toggle: (key: keyof FilterState, value: string) => void;
}) {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{y: '100%'}}
            animate={{y: 0}}
            exit={{y: '100%'}}
            transition={{type: 'tween', ease: [0.65, 0, 0.35, 1], duration: 0.5}}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-cream p-6 shadow-2xl lg:hidden"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-2xl">Refine</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="mb-2 small-caps text-xs text-gold">
                Clear all ({activeCount})
              </button>
            )}

            <div className="divide-y divide-ink/10">
              <MobileGroup title="Price">
                <CheckList
                  items={PRICE_BANDS.map((band) => ({value: band.id, label: band.label}))}
                  selected={filters.priceBands}
                  onToggle={(value) => toggle('priceBands', value)}
                />
              </MobileGroup>
              <MobileGroup title="Color">
                <ColorList
                  items={facets.colors}
                  selected={filters.colors}
                  onToggle={(value) => toggle('colors', value)}
                />
              </MobileGroup>
              <MobileGroup title="Occasion">
                <CheckList
                  items={facets.occasions.map((value) => ({value, label: value}))}
                  selected={filters.occasions}
                  onToggle={(value) => toggle('occasions', value)}
                />
              </MobileGroup>
              <MobileGroup title="Fabric">
                <CheckList
                  items={facets.fabrics.map((value) => ({value, label: value}))}
                  selected={filters.fabrics}
                  onToggle={(value) => toggle('fabrics', value)}
                />
              </MobileGroup>
              <MobileGroup title="Size">
                <SizeGrid
                  sizes={facets.sizes}
                  selected={filters.sizes}
                  onToggle={(value) => toggle('sizes', value)}
                />
              </MobileGroup>
              <MobileGroup title="Availability">
                <CheckList
                  items={[{value: 'in-stock', label: 'In stock only'}]}
                  selected={filters.availability}
                  onToggle={(value) => toggle('availability', value)}
                />
              </MobileGroup>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="mt-8 w-full bg-ink py-3 text-ivory small-caps"
            >
              View {sortedLength} {sortedLength === 1 ? 'piece' : 'pieces'}
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterDropdown({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onEsc = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-1.5 px-3 py-1.5 small-caps text-xs transition-colors ${
          open ? 'text-ink' : 'text-ink/70 hover:text-ink'
        }`}
      >
        {label}
        {count > 0 && <span className="text-gold">({count})</span>}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -6}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -6}}
            transition={{duration: 0.22, ease: [0.65, 0, 0.35, 1]}}
            className="absolute left-0 top-full mt-2 min-w-[220px] border border-ink/10 bg-ivory/95 backdrop-blur-md shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] p-4 z-40"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckList({
  items,
  selected,
  onToggle,
}: {
  items: {value: string; label: string}[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {items.map((item) => {
        const on = selected.includes(item.value);
        return (
          <li key={item.value}>
            <button
              onClick={() => onToggle(item.value)}
              className="group flex w-full items-center gap-3 text-left"
            >
              <span
                className={`relative flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors ${
                  on ? 'border-gold bg-gold' : 'border-ink/30 group-hover:border-ink/60'
                }`}
              >
                {on && <Check className="h-2.5 w-2.5 text-ivory" strokeWidth={3} />}
              </span>
              <span
                className={`text-sm transition-colors ${
                  on ? 'text-ink' : 'text-ink/70 group-hover:text-ink'
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ColorList({
  items,
  selected,
  onToggle,
}: {
  items: {name: string; hex?: string}[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {items.map((color) => {
        const on = selected.includes(color.name);
        return (
          <li key={color.name}>
            <button
              onClick={() => onToggle(color.name)}
              className="group flex w-full items-center gap-3 text-left"
            >
              <span
                className={`relative h-5 w-5 shrink-0 rounded-full border transition-all ${
                  on
                    ? 'border-ink ring-1 ring-gold ring-offset-1 ring-offset-ivory'
                    : 'border-ink/20 group-hover:border-ink/50'
                }`}
                style={{backgroundColor: color.hex ?? 'transparent'}}
                aria-hidden
              />
              <span
                className={`text-sm transition-colors ${
                  on ? 'text-ink' : 'text-ink/70 group-hover:text-ink'
                }`}
              >
                {color.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SizeGrid({
  sizes,
  selected,
  onToggle,
}: {
  sizes: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 min-w-[200px]">
      {sizes.map((size) => {
        const on = selected.includes(size);
        return (
          <button
            key={size}
            onClick={() => onToggle(size)}
            className={`border py-2 text-xs small-caps transition-colors ${
              on
                ? 'border-ink bg-ink text-ivory'
                : 'border-ink/20 text-ink/70 hover:border-ink/60 hover:text-ink'
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function MobileGroup({title, children}: {title: string; children: React.ReactNode}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between"
      >
        <span className="small-caps tracking-[0.2em] text-ink">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.3, ease: [0.65, 0, 0.35, 1]}}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getRequiredCollectionMetafield(collection: any, key: string) {
  const value = getMetafieldValue(collection, key);
  if (!value) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      `collection metafield custom.${key}`,
      `Create a collection metafield custom.${key} in Shopify Admin to fully match the TanStack collection UI.`,
    );
  }
  return value;
}

function getProductColor(product: any) {
  const metafieldColor = getMetafieldValue(product, 'color');
  const optionColor = getProductOptionValues(product, 'color')[0];
  const name = metafieldColor ?? optionColor ?? '';
  const hex = getMetafieldValue(product, 'color_hex') ?? undefined;

  if (!name) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.color or variant option Color',
      'Add custom.color or a Color variant option in Shopify Admin so collection color filters can match the TanStack UI.',
    );
  }

  return {name, hex};
}

function getProductFabric(product: any) {
  const metafieldFabric = getMetafieldValue(product, 'fabric');
  const optionFabric = getProductOptionValues(product, 'fabric')[0];
  const fabric = metafieldFabric ?? optionFabric ?? '';

  if (!fabric) {
    logMissingShopifyField(
      `product:${product.handle}`,
      'product metafield custom.fabric or variant option Fabric',
      'Add custom.fabric or a Fabric variant option in Shopify Admin so collection fabric filters can match the TanStack UI.',
    );
  }

  return fabric;
}

function getProductOptionValues(product: any, optionName: string): string[] {
  const option = product.options?.find(
    (candidate: {name?: string}) =>
      candidate.name?.toLowerCase() === optionName.toLowerCase(),
  );

  return (option?.optionValues ?? [])
    .map((value: {name?: string}) => value.name)
    .filter((value: string | undefined): value is string => Boolean(value));
}

function getProductPrice(product: any) {
  return parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
}

function isNewProduct(product: any) {
  return tagIncludes(product.tags, 'new-arrival') || tagIncludes(product.tags, 'new');
}

function isBestSellerProduct(product: any) {
  return (
    tagIncludes(product.tags, 'best-seller') ||
    tagIncludes(product.tags, 'best-sellers') ||
    tagIncludes(product.tags, 'bestseller') ||
    tagIncludes(product.tags, 'bestsellers')
  );
}

function createNewArrivalsCollection(products: any[], pageInfo?: any) {
  const image =
    products.find((product) => product.featuredImage?.url)?.featuredImage ??
    products.find((product) => product.images?.nodes?.[0]?.url)?.images?.nodes?.[0] ??
    null;

  return {
    id: 'virtual-new-arrivals',
    handle: 'new-arrivals',
    title: 'New Arrivals',
    description:
      'Freshly arrived chikankari pieces from the ilham atelier.',
    image,
    metafields: [
      {
        key: 'tagline',
        namespace: 'custom',
        value: 'Freshly off the loom',
      },
      {
        key: 'category',
        namespace: 'custom',
        value: 'New arrivals',
      },
    ],
    products: {
      nodes: products,
      pageInfo,
    },
  };
}

function createBestSellersCollection(products: any[], pageInfo?: any) {
  const image =
    products.find((product) => product.featuredImage?.url)?.featuredImage ??
    products.find((product) => product.images?.nodes?.[0]?.url)?.images?.nodes?.[0] ??
    null;

  return {
    id: 'virtual-best-sellers',
    handle: 'best-sellers',
    title: 'Best Sellers',
    description: 'The pieces customers return to again and again.',
    image,
    metafields: [
      {
        key: 'tagline',
        namespace: 'custom',
        value: 'Returned to, again and again',
      },
      {
        key: 'category',
        namespace: 'custom',
        value: 'Best sellers',
      },
    ],
    products: {
      nodes: products,
      pageInfo,
    },
  };
}

function logCollectionRequirements(collection: any) {
  if (!collection.image?.url) {
    logMissingShopifyField(
      `collection:${collection.handle}`,
      'collection.image',
      'Add a collection image in Shopify Admin so collection pages and cards match the TanStack visual layout.',
    );
  }
  if (!collection.products?.nodes?.length) {
    console.warn(
      `Missing Shopify field: collection.products. Add products to collection "${collection.handle}" in Shopify Admin.`,
    );
  }
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment IlhamCollectionProductVariant on ProductVariant {
    id
    title
    availableForSale
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      id
      handle
      title
      vendor
      productType
    }
    selectedOptions {
      name
      value
    }
  }
` as const;

const COLLECTION_PRODUCT_FRAGMENT = `#graphql
  fragment IlhamCollectionProduct on Product {
    id
    title
    handle
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 3) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variantsCount {
      count
    }
    selectedOrFirstAvailableVariant {
      ...IlhamCollectionProductVariant
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "subtitle"},
      {namespace: "custom", key: "fabric"},
      {namespace: "custom", key: "color"},
      {namespace: "custom", key: "color_hex"},
      {namespace: "custom", key: "occasions"}
    ]) {
      key
      namespace
      value
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const COLLECTION_QUERY = `#graphql
  query Collection(
    $country: CountryCode
    $after: String
    $first: Int!
    $handle: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      metafields(identifiers: [
        {namespace: "custom", key: "tagline"},
        {namespace: "custom", key: "category"}
      ]) {
        key
        namespace
        value
      }
      products(first: $first, after: $after) {
        nodes {
          ...IlhamCollectionProduct
        }
        pageInfo {
          endCursor
          hasNextPage
          startCursor
        }
      }
    }
  }
  ${COLLECTION_PRODUCT_FRAGMENT}
` as const;

const NEW_ARRIVALS_QUERY = `#graphql
  query NewArrivals(
    $country: CountryCode
    $after: String
    $first: Int!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...IlhamCollectionProduct
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
      }
    }
  }
  ${COLLECTION_PRODUCT_FRAGMENT}
` as const;

const BEST_SELLERS_QUERY = `#graphql
  query BestSellers(
    $country: CountryCode
    $after: String
    $first: Int!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, sortKey: BEST_SELLING) {
      nodes {
        ...IlhamCollectionProduct
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
      }
    }
  }
  ${COLLECTION_PRODUCT_FRAGMENT}
` as const;
