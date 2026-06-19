import {useEffect, useState} from 'react';

export type LayoutCommerce = {
  collections?: {nodes?: any[]};
  products?: {nodes?: any[]};
};

type LayoutCommercePayload = {
  layoutCommerce?: LayoutCommerce;
  message?: string;
};

let cachedLayoutCommerce: LayoutCommerce | null = null;
let layoutCommercePromise: Promise<LayoutCommerce> | null = null;

export function loadLayoutCommerce() {
  if (cachedLayoutCommerce) return Promise.resolve(cachedLayoutCommerce);
  if (layoutCommercePromise) return layoutCommercePromise;

  layoutCommercePromise = fetch('/api/layout-commerce', {
    headers: {Accept: 'application/json'},
  })
    .then(async (response) => {
      const payload = (await response
        .json()
        .catch(() => ({}))) as LayoutCommercePayload;
      if (!response.ok || !payload.layoutCommerce) {
        throw new Error(payload.message || 'Atelier navigation is unavailable.');
      }
      cachedLayoutCommerce = payload.layoutCommerce;
      return payload.layoutCommerce;
    })
    .catch((error) => {
      layoutCommercePromise = null;
      throw error;
    });

  return layoutCommercePromise;
}

export function prefetchLayoutCommerce() {
  void loadLayoutCommerce().catch(() => undefined);
}

export function useLayoutCommerce(enabled: boolean) {
  const [data, setData] = useState<LayoutCommerce | null>(
    cachedLayoutCommerce,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || data) return;
    let active = true;

    void loadLayoutCommerce()
      .then((layoutCommerce) => {
        if (active) setData(layoutCommerce);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Atelier navigation is unavailable.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [data, enabled]);

  return {data, error, loading: enabled && !data && !error};
}
