import type {Route} from './+types/api.order-feedback';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

type FeedbackEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
};

type FeedbackBody = {
  experienceRating?: number;
  recommendationRating?: number;
  message?: string;
  source?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return json({message: 'Method not allowed.'}, 405);
  }

  context.customerAccount.handleAuthStatus();

  const body = (await request.json().catch(() => ({}))) as FeedbackBody;
  const experienceRating = normalizeRating(body.experienceRating);
  const recommendationRating = normalizeRating(body.recommendationRating);

  if (!experienceRating || !recommendationRating) {
    return json({message: 'Please choose both ratings.'}, 400);
  }

  const {data, errors} = await context.customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: context.customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer?.id) {
    return json({message: 'Could not identify the customer.'}, 401);
  }

  const payload = {
    experienceRating,
    recommendationRating,
    message: sanitizeMessage(body.message),
    source: body.source ?? 'account-profile',
    submittedAt: new Date().toISOString(),
  };

  const saved = await saveFeedbackToShopify({
    env: context.env as unknown as FeedbackEnv,
    customerId: data.customer.id,
    payload,
  });

  if (!saved) {
    return json(
      {
        message:
          'Feedback received, but Shopify Admin API feedback saving is not configured yet.',
        saved: false,
      },
      202,
    );
  }

  return json({message: 'Feedback saved.', saved: true});
}

export function loader() {
  return json({message: 'Use POST to submit order feedback.'}, 405);
}

async function saveFeedbackToShopify({
  customerId,
  env,
  payload,
}: {
  customerId: string;
  env: FeedbackEnv;
  payload: {
    experienceRating: number;
    recommendationRating: number;
    message: string;
    source: string;
    submittedAt: string;
  };
}) {
  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  const adminToken = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;
  if (!shopDomain || !adminToken) return false;

  const lowFeedback =
    payload.experienceRating <= 2 || payload.recommendationRating <= 2;

  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2026-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: SAVE_FEEDBACK_MUTATION,
        variables: {
          customerId,
          customer: {
            id: customerId,
            metafields: [
              {
                namespace: 'custom',
                key: 'checkout_feedback_latest',
                type: 'json',
                value: JSON.stringify(payload),
              },
            ],
          },
          tags: lowFeedback
            ? ['checkout-feedback', 'checkout-feedback-low']
            : ['checkout-feedback'],
        },
      }),
    });
    const jsonPayload = (await response.json()) as {
      data?: {
        customerUpdate?: {userErrors?: {message?: string}[]};
        tagsAdd?: {userErrors?: {message?: string}[]};
      };
      errors?: {message?: string}[];
    };
    const userErrors = [
      ...(jsonPayload.data?.customerUpdate?.userErrors ?? []),
      ...(jsonPayload.data?.tagsAdd?.userErrors ?? []),
    ];

    if (!response.ok || jsonPayload.errors?.length || userErrors.length) {
      console.error('[feedback] Shopify Admin API rejected feedback save:', {
        status: response.status,
        errors: jsonPayload.errors,
        userErrors,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('[feedback] Shopify Admin API feedback save failed:', error);
    return false;
  }
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

// This is a private Shopify Admin API mutation, so it intentionally avoids
// the `#graphql` marker that Hydrogen codegen uses for Storefront API documents.
const SAVE_FEEDBACK_MUTATION = `
  mutation SaveCheckoutFeedback($customer: CustomerInput!, $customerId: ID!, $tags: [String!]!) {
    customerUpdate(input: $customer) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
    tagsAdd(id: $customerId, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
