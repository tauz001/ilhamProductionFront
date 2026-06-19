type QuickViewPayload = {
  message?: string;
  product?: any;
};

type CacheEntry = {
  expiresAt: number;
  promise: Promise<any>;
};

const QUICK_VIEW_CACHE_TTL_MS = 60_000;
const quickViewCache = new Map<string, CacheEntry>();

export function loadQuickViewProduct(handle: string) {
  const normalizedHandle = handle.trim();
  const cached = quickViewCache.get(normalizedHandle);

  if (cached && cached.expiresAt > Date.now()) return cached.promise;
  if (cached) quickViewCache.delete(normalizedHandle);

  const promise = fetch(
    `/api/product-quick-view?handle=${encodeURIComponent(normalizedHandle)}`,
    {headers: {Accept: 'application/json'}},
  )
    .then(async (response) => {
      const payload = (await response.json().catch(() => ({}))) as QuickViewPayload;
      if (!response.ok || !payload.product) {
        throw new Error(payload.message || 'Quick view is unavailable.');
      }
      return payload.product;
    })
    .catch((error) => {
      quickViewCache.delete(normalizedHandle);
      throw error;
    });

  quickViewCache.set(normalizedHandle, {
    expiresAt: Date.now() + QUICK_VIEW_CACHE_TTL_MS,
    promise,
  });

  return promise;
}

export function prefetchQuickViewProduct(handle: string) {
  void loadQuickViewProduct(handle).catch(() => undefined);
}
