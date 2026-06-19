import type {Route} from './+types/api.order-feedback';
import {CUSTOMER_ORDER_FEEDBACK_OWNERSHIP_QUERY} from '~/graphql/customer-account/CustomerOrderFeedbackQuery';
import {getNumericOrderId, getOrderGid} from '~/lib/customer-account/order-route-id';

type FeedbackEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
};

type FeedbackBody = {
  action?: 'claim-prompt' | 'submit';
  experienceRating?: number;
  message?: string;
  orderId?: string;
  recommendationRating?: number;
  source?: string;
};

type FeedbackState = {
  experienceRating?: number;
  message?: string;
  promptedAt: string;
  recommendationRating?: number;
  source?: string;
  submittedAt?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return json({message: 'Method not allowed.'}, 405);
  }

  context.customerAccount.handleAuthStatus();

  const body = (await request.json().catch(() => ({}))) as FeedbackBody;
  const orderId = normalizeOrderId(body.orderId);
  if (!orderId) return json({message: 'A valid order is required.'}, 400);

  const ownsOrder = await customerOwnsOrder({
    context,
    orderId,
  });
  if (!ownsOrder) {
    return json({message: 'This order is not available for feedback.'}, 403);
  }

  const env = context.env as unknown as FeedbackEnv;

  if (body.action === 'claim-prompt') {
    const currentState = await readOrderFeedbackState({env, orderId});
    if (currentState?.promptedAt) {
      return json({
        show: false,
        persisted: true,
        submitted: Boolean(currentState.submittedAt),
      });
    }

    const promptedAt = new Date().toISOString();
    const persisted = await saveOrderFeedbackState({
      env,
      orderId,
      state: {promptedAt},
    });

    return json({show: true, persisted, submitted: false});
  }

  if (body.action !== 'submit') {
    return json({message: 'Unknown feedback action.'}, 400);
  }

  const experienceRating = normalizeRating(body.experienceRating);
  const recommendationRating = normalizeRating(body.recommendationRating);
  if (!experienceRating || !recommendationRating) {
    return json({message: 'Please choose both ratings.'}, 400);
  }

  const currentState = await readOrderFeedbackState({env, orderId});
  const state: FeedbackState = {
    promptedAt: currentState?.promptedAt ?? new Date().toISOString(),
    experienceRating,
    recommendationRating,
    message: sanitizeMessage(body.message),
    source: body.source ?? 'order-detail',
    submittedAt: new Date().toISOString(),
  };
  const saved = await saveOrderFeedbackState({
    env,
    orderId,
    state,
    tags:
      experienceRating <= 2 || recommendationRating <= 2
        ? ['order-feedback', 'order-feedback-low']
        : ['order-feedback'],
  });

  if (!saved) {
    return json(
      {
        message:
          'Feedback received, but Shopify order feedback saving is not configured yet.',
        saved: false,
      },
      202,
    );
  }

  return json({message: 'Feedback saved.', saved: true});
}

export function loader() {
  return json({message: 'Use POST for order feedback.'}, 405);
}

async function customerOwnsOrder({
  context,
  orderId,
}: {
  context: Route.ActionArgs['context'];
  orderId: string;
}) {
  const numericOrderId = getNumericOrderId(orderId);
  const result = await context.customerAccount
    .query(CUSTOMER_ORDER_FEEDBACK_OWNERSHIP_QUERY, {
      variables: {
        first: 10,
        query: numericOrderId ? `id:${numericOrderId}` : null,
        language: context.customerAccount.i18n.language,
      },
    })
    .catch((error: Error) => {
      console.error('[feedback] Customer order ownership lookup failed:', error);
      return null;
    });

  if (!result || result.errors?.length) return false;

  return (result.data?.customer?.orders?.nodes ?? []).some(
    (order) => getOrderGid(order.id) === orderId,
  );
}

async function readOrderFeedbackState({
  env,
  orderId,
}: {
  env: FeedbackEnv;
  orderId: string;
}) {
  const response = await adminGraphqlRequest({
    env,
    query: READ_ORDER_FEEDBACK_QUERY,
    variables: {orderId},
  });
  const value = response?.data?.order?.metafield?.value;
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value) as FeedbackState;
  } catch {
    console.warn('[feedback] Ignoring malformed order feedback state:', {orderId});
    return null;
  }
}

async function saveOrderFeedbackState({
  env,
  orderId,
  state,
  tags = [],
}: {
  env: FeedbackEnv;
  orderId: string;
  state: FeedbackState;
  tags?: string[];
}) {
  const response = await adminGraphqlRequest({
    env,
    query: SAVE_ORDER_FEEDBACK_MUTATION,
    variables: {
      metafields: [
        {
          ownerId: orderId,
          namespace: 'custom',
          key: 'order_feedback',
          type: 'json',
          value: JSON.stringify(state),
        },
      ],
      orderId,
      tags,
    },
  });
  if (!response) return false;

  const userErrors = [
    ...(response.data?.metafieldsSet?.userErrors ?? []),
    ...(response.data?.tagsAdd?.userErrors ?? []),
  ];
  if (response.errors?.length || userErrors.length) {
    console.error('[feedback] Shopify rejected order feedback:', {
      errors: response.errors,
      userErrors,
    });
    return false;
  }

  return true;
}

async function adminGraphqlRequest({
  env,
  query,
  variables,
}: {
  env: FeedbackEnv;
  query: string;
  variables: Record<string, unknown>;
}) {
  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  const adminToken = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;
  if (!shopDomain || !adminToken) return null;

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2026-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({query, variables}),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      console.error('[feedback] Shopify Admin API request failed:', {
        status: response.status,
        errors: payload.errors,
      });
      return null;
    }
    return payload;
  } catch (error) {
    console.error('[feedback] Shopify Admin API request crashed:', error);
    return null;
  }
}

function normalizeOrderId(value: unknown) {
  const orderId = String(value ?? '').trim();
  if (!orderId) return null;
  const normalized = getOrderGid(orderId);
  return getNumericOrderId(normalized) ? normalized : null;
}

function normalizeShopDomain(domain?: string | null) {
  return (
    domain
      ?.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '') || null
  );
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return null;
  return rating;
}

function sanitizeMessage(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

const READ_ORDER_FEEDBACK_QUERY = `
  query ReadOrderFeedback($orderId: ID!) {
    order: node(id: $orderId) {
      ... on Order {
        metafield(namespace: "custom", key: "order_feedback") {
          value
        }
      }
    }
  }
` as const;

const SAVE_ORDER_FEEDBACK_MUTATION = `
  mutation SaveOrderFeedback(
    $metafields: [MetafieldsSetInput!]!
    $orderId: ID!
    $tags: [String!]!
  ) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
    tagsAdd(id: $orderId, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
` as const;
