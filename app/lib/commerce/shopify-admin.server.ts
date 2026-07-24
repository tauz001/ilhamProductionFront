export type ShopifyAdminEnv = {
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
  PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?: string;
  PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

export type ShopifyAdminGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{
    extensions?: Record<string, unknown>;
    message?: string;
  }>;
};

type CachedAdminToken = {
  accessToken: string;
  expiresAt: number;
};

type AdminTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

const cachedTokens = new Map<string, CachedAdminToken>();
const pendingTokenRequests = new Map<string, Promise<string | null>>();

export function hasShopifyAdminConfig(env: ShopifyAdminEnv) {
  const hasClientCredentials = Boolean(
    env.PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?.trim() &&
      env.PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?.trim(),
  );

  return Boolean(
    normalizeShopDomain(env.PUBLIC_STORE_DOMAIN) &&
      (hasClientCredentials ||
        env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN?.trim()),
  );
}

export async function shopifyAdminGraphqlRequest<T>({
  apiVersion,
  env,
  logLabel,
  query,
  variables = {},
}: {
  apiVersion: string;
  env: ShopifyAdminEnv;
  logLabel: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<ShopifyAdminGraphqlResponse<T> | null> {
  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  if (!shopDomain) {
    console.error(`[shopify-admin] Missing store domain: ${logLabel}`);
    return null;
  }

  let accessToken = await getShopifyAdminAccessToken({
    env,
    shopDomain,
  });
  if (!accessToken) {
    console.error(`[shopify-admin] Missing valid credentials: ${logLabel}`);
    return null;
  }

  let result = await requestAdminGraphql<T>({
    accessToken,
    apiVersion,
    logLabel,
    query,
    shopDomain,
    variables,
  });

  if (result.status === 401 && hasClientCredentials(env)) {
    accessToken = await getShopifyAdminAccessToken({
      env,
      forceRefresh: true,
      shopDomain,
    });

    if (!accessToken) return null;

    result = await requestAdminGraphql<T>({
      accessToken,
      apiVersion,
      logLabel,
      query,
      shopDomain,
      variables,
    });
  }

  if (!result.ok) {
    console.error(`[shopify-admin] Admin API request failed: ${logLabel}`, {
      status: result.status,
    });
    return null;
  }

  return result.payload;
}

async function getShopifyAdminAccessToken({
  env,
  forceRefresh = false,
  shopDomain,
}: {
  env: ShopifyAdminEnv;
  forceRefresh?: boolean;
  shopDomain: string;
}) {
  const clientId = env.PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?.trim();
  const clientSecret = env.PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?.trim();
  const fallbackToken = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN?.trim() || null;

  if (!clientId || !clientSecret) return fallbackToken;

  const cacheKey = `${shopDomain}|${clientId}`;
  if (forceRefresh) {
    cachedTokens.delete(cacheKey);
    const pending = pendingTokenRequests.get(cacheKey);
    if (pending) return pending;
  } else {
    const cached = cachedTokens.get(cacheKey);
    if (cached && cached.expiresAt - TOKEN_REFRESH_BUFFER_MS > Date.now()) {
      return cached.accessToken;
    }

    const pending = pendingTokenRequests.get(cacheKey);
    if (pending) return pending;
  }

  const request = requestClientCredentialsToken({
    cacheKey,
    clientId,
    clientSecret,
    shopDomain,
  }).finally(() => {
    pendingTokenRequests.delete(cacheKey);
  });

  pendingTokenRequests.set(cacheKey, request);
  return request;
}

async function requestClientCredentialsToken({
  cacheKey,
  clientId,
  clientSecret,
  shopDomain,
}: {
  cacheKey: string;
  clientId: string;
  clientSecret: string;
  shopDomain: string;
}) {
  try {
    const response = await fetch(
      `https://${shopDomain}/admin/oauth/access_token`,
      {
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      },
    );
    const payload = (await response.json().catch(() => ({}))) as
      | AdminTokenResponse
      | {error?: string};
    const accessToken =
      'access_token' in payload ? payload.access_token?.trim() : '';

    if (!response.ok || !accessToken) {
      console.error('[shopify-admin] Could not refresh Admin access token.', {
        status: response.status,
      });
      return null;
    }

    const expiresIn =
      'expires_in' in payload &&
      Number.isFinite(payload.expires_in) &&
      Number(payload.expires_in) > 0
        ? Number(payload.expires_in)
        : DEFAULT_TOKEN_LIFETIME_SECONDS;

    cachedTokens.set(cacheKey, {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return accessToken;
  } catch (error) {
    console.error(
      '[shopify-admin] Admin access token refresh crashed.',
      getErrorMessage(error),
    );
    return null;
  }
}

async function requestAdminGraphql<T>({
  accessToken,
  apiVersion,
  logLabel,
  query,
  shopDomain,
  variables,
}: {
  accessToken: string;
  apiVersion: string;
  logLabel: string;
  query: string;
  shopDomain: string;
  variables: Record<string, unknown>;
}) {
  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`,
      {
        body: JSON.stringify({query, variables}),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        method: 'POST',
      },
    );
    const payload = (await response.json().catch(() => ({}))) as
      ShopifyAdminGraphqlResponse<T>;

    return {
      ok: response.ok,
      payload,
      status: response.status,
    };
  } catch (error) {
    console.error(
      `[shopify-admin] Admin API request crashed: ${logLabel}`,
      getErrorMessage(error),
    );
    return {
      ok: false,
      payload: {} as ShopifyAdminGraphqlResponse<T>,
      status: 0,
    };
  }
}

function hasClientCredentials(env: ShopifyAdminEnv) {
  return Boolean(
    env.PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?.trim() &&
      env.PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?.trim(),
  );
}

function normalizeShopDomain(domain?: string | null) {
  return (
    domain
      ?.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '') || null
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}
