export type CollectionFilterState = {
  categories: string[];
  priceBands: string[];
  colors: string[];
  occasions: string[];
  fabrics: string[];
  sizes: string[];
  availability: string[];
};

export type CollectionFilterKey = keyof CollectionFilterState;

export const PRICE_BANDS = [
  {id: '0-15000', label: 'Under Rs. 15,000', min: 0, max: 15000},
  {id: '15000-25000', label: 'Rs. 15,000 - Rs. 25,000', min: 15000, max: 25000},
  {id: '25000-50000', label: 'Rs. 25,000 - Rs. 50,000', min: 25000, max: 50000},
  {id: '50000-9999999', label: 'Above Rs. 50,000', min: 50000, max: 9999999},
];

export const EMPTY_COLLECTION_FILTERS: CollectionFilterState = {
  categories: [],
  priceBands: [],
  colors: [],
  occasions: [],
  fabrics: [],
  sizes: [],
  availability: [],
};

export const SORT_OPTIONS = new Set(['featured', 'new', 'price-asc', 'price-desc']);

const PARAM_BY_FILTER_KEY: Record<CollectionFilterKey, string> = {
  categories: 'category',
  priceBands: 'price',
  colors: 'color',
  occasions: 'occasion',
  fabrics: 'fabric',
  sizes: 'size',
  availability: 'availability',
};

export function getCollectionFilterParam(key: CollectionFilterKey) {
  return PARAM_BY_FILTER_KEY[key];
}

export function parseCollectionFilters(
  searchParams: URLSearchParams,
): CollectionFilterState {
  return {
    categories: getParamValues(searchParams, 'category'),
    priceBands: getParamValues(searchParams, 'price'),
    colors: getParamValues(searchParams, 'color'),
    occasions: getParamValues(searchParams, 'occasion'),
    fabrics: getParamValues(searchParams, 'fabric'),
    sizes: getParamValues(searchParams, 'size'),
    availability: getParamValues(searchParams, 'availability'),
  };
}

export function getCollectionSearchTerm(searchParams: URLSearchParams) {
  return searchParams.get('q')?.trim() ?? '';
}

export function getCollectionSort(searchParams: URLSearchParams) {
  const sort = searchParams.get('sort') ?? 'featured';
  return SORT_OPTIONS.has(sort) ? sort : 'featured';
}

export function toggleCollectionFilterValue(
  searchParams: URLSearchParams,
  key: CollectionFilterKey,
  value: string,
) {
  const next = new URLSearchParams(searchParams);
  const param = PARAM_BY_FILTER_KEY[key];
  const values = getParamValues(next, param);
  const normalized = value.trim();
  const nextValues = values.includes(normalized)
    ? values.filter((item) => item !== normalized)
    : [...values, normalized];

  setParamValues(next, param, nextValues);
  return next;
}

export function setCollectionSearchTerm(
  searchParams: URLSearchParams,
  value: string,
) {
  const next = new URLSearchParams(searchParams);
  const term = value.trim();
  if (term) next.set('q', term);
  else next.delete('q');
  return next;
}

export function setCollectionSort(searchParams: URLSearchParams, value: string) {
  const next = new URLSearchParams(searchParams);
  if (!value || value === 'featured') next.delete('sort');
  else next.set('sort', value);
  return next;
}

export function clearCollectionFilters(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  Object.values(PARAM_BY_FILTER_KEY).forEach((param) => next.delete(param));
  next.delete('q');
  return next;
}

export function buildCollectionFilterHref({
  handle,
  filter,
  value,
  q,
}: {
  handle: string;
  filter?: CollectionFilterKey;
  value?: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  if (filter && value) {
    params.set(PARAM_BY_FILTER_KEY[filter], value);
  }

  if (q?.trim()) {
    params.set('q', q.trim());
  }

  const query = params.toString();
  return `/collections/${handle}${query ? `?${query}` : ''}`;
}

function getParamValues(searchParams: URLSearchParams, name: string) {
  const raw = [
    ...searchParams.getAll(name),
    ...searchParams.getAll(`${name}[]`),
  ];

  return raw
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

function setParamValues(
  searchParams: URLSearchParams,
  name: string,
  values: string[],
) {
  searchParams.delete(name);
  searchParams.delete(`${name}[]`);

  const uniqueValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  if (uniqueValues.length) {
    searchParams.set(name, uniqueValues.join(','));
  }
}
