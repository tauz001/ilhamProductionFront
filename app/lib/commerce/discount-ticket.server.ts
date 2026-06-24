import type {DiscountTicketOffer} from './discount-ticket';

type DiscountEnv = {
  DISCOUNT_TICKET_TAG?: string;
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

type AdminDiscountNode = {
  discount?: {
    __typename?: string;
    asyncUsageCount?: number;
    codes?: {nodes?: Array<{code?: string | null}> | null} | null;
    endsAt?: string | null;
    shortSummary?: string | null;
    status?: string;
    summary?: string | null;
    title?: string | null;
    usageLimit?: number | null;
  } | null;
};

type CachedOffer = {
  expiresAt: number;
  key: string;
  promise: Promise<DiscountTicketOffer | null>;
};

const DEFAULT_TICKET_SELECTOR = 'storefront-ticket';
const CACHE_MS = 5 * 60 * 1000;
const ERROR_CACHE_MS = 45 * 1000;

let cachedOffer: CachedOffer | null = null;

export function fetchFeaturedDiscountOffer(env: DiscountEnv) {
  const now = Date.now();
  const cacheKey = getDiscountCacheKey(env);
  if (cachedOffer?.key === cacheKey && cachedOffer.expiresAt > now) {
    return cachedOffer.promise;
  }

  const promise = readFeaturedDiscountOffer(env);
  cachedOffer = {
    expiresAt: now + CACHE_MS,
    key: cacheKey,
    promise,
  };

  void promise.then((offer) => {
    if (offer || cachedOffer?.key !== cacheKey) return;
    cachedOffer = {
      expiresAt: Date.now() + ERROR_CACHE_MS,
      key: cacheKey,
      promise: Promise.resolve(null),
    };
  });

  void promise.catch(() => {
    cachedOffer = {
      expiresAt: Date.now() + ERROR_CACHE_MS,
      key: cacheKey,
      promise: Promise.resolve(null),
    };
  });

  return promise;
}

async function readFeaturedDiscountOffer(
  env: DiscountEnv,
): Promise<DiscountTicketOffer | null> {
  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  const token = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;
  const selector = normalizeDiscountSelector(env.DISCOUNT_TICKET_TAG);

  if (!shopDomain || !token) {
    return null;
  }

  for (const query of buildDiscountQueries(selector)) {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2026-04/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: FEATURED_DISCOUNT_QUERY,
          variables: {
            first: 10,
            query,
          },
        }),
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      data?: {discountNodes?: {nodes?: AdminDiscountNode[] | null} | null};
      errors?: Array<{message?: string}>;
    };

    if (!response.ok || payload.errors?.length) {
      console.warn(
        '[discount-ticket] Could not read Shopify discounts. Confirm PRIVATE_SHOPIFY_ADMIN_API_TOKEN has read_discounts and one active code discount matches DISCOUNT_TICKET_TAG by tag, code, or title.',
      );
      return null;
    }

    const nodes = payload.data?.discountNodes?.nodes ?? [];
    const offer = nodes.map(normalizeDiscountNode).find(Boolean);
    if (offer) return offer;
  }

  return null;
}

function normalizeDiscountNode(
  node: AdminDiscountNode,
): DiscountTicketOffer | null {
  const discount = node.discount;
  const code = discount?.codes?.nodes?.[0]?.code?.trim();
  const status = discount?.status?.toUpperCase();

  if (!discount || !code || status !== 'ACTIVE') return null;
  if (
    discount.usageLimit &&
    Number(discount.asyncUsageCount ?? 0) >= discount.usageLimit
  ) {
    return null;
  }

  return {
    code,
    endsAt: discount.endsAt ?? null,
    summary:
      discount.shortSummary?.trim() ||
      discount.summary?.trim() ||
      discount.title?.trim() ||
      'A current ilham atelier offer from Shopify.',
    title: discount.title?.trim() || 'Atelier offer',
    type: getDiscountType(discount.__typename),
  };
}

function getDiscountType(typename?: string): DiscountTicketOffer['type'] {
  const normalized = typename?.toLowerCase() ?? '';
  if (normalized.includes('freeshipping')) return 'free-shipping';
  if (normalized.includes('bxgy')) return 'bxgy';
  if (normalized.includes('basic')) return 'unknown';
  return 'unknown';
}

function buildDiscountQueries(selector: string) {
  const value = escapeSearchValue(selector);
  return [
    `method:code status:active tag:${value}`,
    `method:code status:active code:${value}`,
    `method:code status:active title:${value}`,
    `method:code status:active ${value}`,
  ];
}

function escapeSearchValue(value: string) {
  if (/^[a-zA-Z0-9_-]+$/.test(value)) return value;
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function normalizeDiscountSelector(selector?: string) {
  return selector?.trim() || DEFAULT_TICKET_SELECTOR;
}

function getDiscountCacheKey(env: DiscountEnv) {
  return [
    normalizeShopDomain(env.PUBLIC_STORE_DOMAIN),
    normalizeDiscountSelector(env.DISCOUNT_TICKET_TAG),
  ].join('|');
}

function normalizeShopDomain(domain?: string) {
  if (!domain?.trim()) return '';
  try {
    return new URL(
      domain.startsWith('http') ? domain : `https://${domain}`,
    ).hostname;
  } catch {
    return domain.trim().replace(/^https?:\/\//, '').split('/')[0];
  }
}

const FEATURED_DISCOUNT_QUERY = `
  query FeaturedDiscountTicket($first: Int!, $query: String!) {
    discountNodes(first: $first, query: $query, reverse: true) {
      nodes {
        discount {
          __typename
          ... on DiscountCodeBasic {
            asyncUsageCount
            codes(first: 1) {
              nodes {
                code
              }
            }
            endsAt
            shortSummary
            status
            summary
            title
            usageLimit
          }
          ... on DiscountCodeBxgy {
            asyncUsageCount
            codes(first: 1) {
              nodes {
                code
              }
            }
            endsAt
            status
            summary
            title
            usageLimit
          }
          ... on DiscountCodeFreeShipping {
            asyncUsageCount
            codes(first: 1) {
              nodes {
                code
              }
            }
            endsAt
            shortSummary
            status
            summary
            title
            usageLimit
          }
        }
      }
    }
  }
`;
