export type TrackingLookupMode = 'awb' | 'order';

export type TrackingStage =
  | 'confirmed'
  | 'processing'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export type TrackingEvent = {
  status: string;
  detail?: string | null;
  location?: string | null;
  happenedAt?: string | null;
};

export type ShipmentTracking = {
  source: 'shiprocket' | 'shopify';
  mode: TrackingLookupMode;
  reference: string;
  orderName?: string | null;
  awb?: string | null;
  courier?: string | null;
  currentStatus: string;
  stage: TrackingStage;
  eta?: string | null;
  trackingUrl?: string | null;
  checkedAt: string;
  events: TrackingEvent[];
};

export type OrderTrackingEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
  SHIPROCKET_API_TOKEN?: string;
  SHIPROCKET_EMAIL?: string;
  SHIPROCKET_PASSWORD?: string;
};

type ShopifyTrackingOrder = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  confirmationNumber?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  displayFulfillmentStatus?: string | null;
  customer?: {email?: string | null} | null;
  fulfillments?: Array<{
    status?: string | null;
    updatedAt?: string | null;
    trackingInfo?: Array<{
      company?: string | null;
      number?: string | null;
      url?: string | null;
    }> | null;
  }> | null;
};

type ShiprocketActivity = {
  activity?: unknown;
  date?: unknown;
  location?: unknown;
  status?: unknown;
  'sr-status-label'?: unknown;
};

export class TrackingLookupError extends Error {
  readonly code:
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'CONFIGURATION'
    | 'PROVIDER_UNAVAILABLE';
  readonly status: number;

  constructor(
    message: string,
    code:
      | 'INVALID_INPUT'
      | 'NOT_FOUND'
      | 'CONFIGURATION'
      | 'PROVIDER_UNAVAILABLE',
    status: number,
  ) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let cachedShiprocketToken:
  | {email: string; token: string; expiresAt: number}
  | null = null;

export async function lookupShipment({
  email,
  env,
  mode,
  reference,
}: {
  email?: string;
  env: OrderTrackingEnv;
  mode: TrackingLookupMode;
  reference: string;
}): Promise<ShipmentTracking> {
  if (mode === 'awb') {
    return trackShiprocketAwb({env, awb: normalizeAwb(reference), mode});
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new TrackingLookupError(
      'Enter the email used for this order.',
      'INVALID_INPUT',
      400,
    );
  }

  const orderReference = normalizeOrderReference(reference);
  const order = await findVerifiedShopifyOrder({
    email: normalizedEmail,
    env,
    reference: orderReference,
  });
  const tracking = firstTrackingInfo(order);

  if (!tracking?.number) {
    return shopifyOnlyTracking(order, orderReference);
  }

  try {
    const liveTracking = await trackShiprocketAwb({
      env,
      awb: normalizeAwb(tracking.number),
      mode,
    });
    return {
      ...liveTracking,
      orderName: safeText(order.name, 80),
      reference: orderReference,
      trackingUrl: liveTracking.trackingUrl ?? safeUrl(tracking.url),
      courier: liveTracking.courier ?? safeText(tracking.company, 80),
    };
  } catch (error) {
    if (
      error instanceof TrackingLookupError &&
      (error.code === 'NOT_FOUND' || error.code === 'CONFIGURATION')
    ) {
      return shopifyOnlyTracking(order, orderReference);
    }
    throw error;
  }
}

function normalizeAwb(value: string) {
  const awb = value.trim().replace(/\s+/g, '');
  if (!/^[a-zA-Z0-9-]{6,40}$/.test(awb)) {
    throw new TrackingLookupError(
      'Enter a valid AWB number.',
      'INVALID_INPUT',
      400,
    );
  }
  return awb;
}

function normalizeOrderReference(value: string) {
  const reference = value.trim().replace(/\s+/g, '');
  if (!/^#?[a-zA-Z0-9-]{3,40}$/.test(reference)) {
    throw new TrackingLookupError(
      'Enter a valid order number.',
      'INVALID_INPUT',
      400,
    );
  }
  return reference;
}

function normalizeEmail(value?: string) {
  const email = value?.trim().toLowerCase() ?? '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

async function findVerifiedShopifyOrder({
  email,
  env,
  reference,
}: {
  email: string;
  env: OrderTrackingEnv;
  reference: string;
}) {
  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  const token = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;
  if (!shopDomain || !token) {
    throw new TrackingLookupError(
      'Order tracking is temporarily unavailable.',
      'CONFIGURATION',
      503,
    );
  }

  const candidates = orderSearchQueries(reference);
  for (const query of candidates) {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2026-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: SHOPIFY_TRACKING_ORDER_QUERY,
          variables: {query},
        }),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      data?: {orders?: {nodes?: ShopifyTrackingOrder[] | null} | null};
      errors?: Array<{message?: string}>;
    };

    if (!response.ok || payload.errors?.length) {
      console.error('[order-tracking] Shopify order lookup failed:', {
        status: response.status,
        hasErrors: Boolean(payload.errors?.length),
      });
      throw new TrackingLookupError(
        'Order tracking is temporarily unavailable.',
        'PROVIDER_UNAVAILABLE',
        502,
      );
    }

    const verified = (payload.data?.orders?.nodes ?? []).find((order) =>
      orderEmails(order).includes(email),
    );
    if (verified) return verified;
  }

  throw new TrackingLookupError(
    'We could not match that order number and email.',
    'NOT_FOUND',
    404,
  );
}

function orderSearchQueries(reference: string) {
  const plain = reference.replace(/^#/, '');
  const orderName = `#${plain}`;
  return [
    `name:${orderName}`,
    `confirmation_number:${plain}`,
  ];
}

function orderEmails(order: ShopifyTrackingOrder) {
  return [order.email, order.customer?.email]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));
}

function firstTrackingInfo(order: ShopifyTrackingOrder) {
  return (order.fulfillments ?? [])
    .flatMap((fulfillment) => fulfillment.trackingInfo ?? [])
    .find((tracking) => tracking.number || tracking.url || tracking.company);
}

function shopifyOnlyTracking(
  order: ShopifyTrackingOrder,
  reference: string,
): ShipmentTracking {
  const tracking = firstTrackingInfo(order);
  const currentStatus = shopifyFulfillmentLabel(order.displayFulfillmentStatus);
  const happenedAt =
    order.fulfillments?.find((fulfillment) => fulfillment.updatedAt)?.updatedAt ??
    order.updatedAt ??
    order.createdAt ??
    null;

  return {
    source: 'shopify',
    mode: 'order',
    reference,
    orderName: safeText(order.name, 80),
    awb: safeText(tracking?.number, 80),
    courier: safeText(tracking?.company, 80),
    currentStatus,
    stage: inferTrackingStage(currentStatus),
    trackingUrl: safeUrl(tracking?.url),
    checkedAt: new Date().toISOString(),
    events: [
      {
        status: currentStatus,
        detail: tracking?.number
          ? 'Carrier tracking is available. Live scan history will appear when the carrier reports movement.'
          : 'Your order is confirmed. An AWB appears after the shipment is packed and assigned to a carrier.',
        happenedAt,
      },
    ],
  };
}

async function trackShiprocketAwb({
  awb,
  env,
  mode,
}: {
  awb: string;
  env: OrderTrackingEnv;
  mode: TrackingLookupMode;
}): Promise<ShipmentTracking> {
  const token = await getShiprocketToken(env);
  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(
      awb,
    )}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const payload = (await response.json().catch(() => ({}))) as any;

  if (response.status === 404 || response.status === 422) {
    throw new TrackingLookupError(
      'No shipment was found for that tracking reference.',
      'NOT_FOUND',
      404,
    );
  }
  if (!response.ok) {
    console.error('[order-tracking] Shiprocket tracking failed:', {
      status: response.status,
    });
    throw new TrackingLookupError(
      'Live carrier tracking is temporarily unavailable.',
      'PROVIDER_UNAVAILABLE',
      502,
    );
  }

  return normalizeShiprocketTracking(payload, {awb, mode});
}

async function getShiprocketToken(env: OrderTrackingEnv) {
  if (env.SHIPROCKET_API_TOKEN) return env.SHIPROCKET_API_TOKEN;
  const email = env.SHIPROCKET_EMAIL?.trim() ?? '';
  const password = env.SHIPROCKET_PASSWORD ?? '';
  if (!email || !password) {
    throw new TrackingLookupError(
      'Live carrier tracking is not configured.',
      'CONFIGURATION',
      503,
    );
  }
  if (
    cachedShiprocketToken?.email === email &&
    cachedShiprocketToken.expiresAt > Date.now()
  ) {
    return cachedShiprocketToken.token;
  }

  const response = await fetch(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    },
  );
  const payload = (await response.json().catch(() => ({}))) as {token?: string};
  if (!response.ok || !payload.token) {
    console.error('[order-tracking] Shiprocket authentication failed:', {
      status: response.status,
    });
    throw new TrackingLookupError(
      'Live carrier tracking is temporarily unavailable.',
      'PROVIDER_UNAVAILABLE',
      502,
    );
  }

  cachedShiprocketToken = {
    email,
    token: payload.token,
    expiresAt: Date.now() + 20 * 60 * 1000,
  };
  return payload.token;
}

function normalizeShiprocketTracking(
  payload: any,
  {awb, mode}: {awb: string; mode: TrackingLookupMode},
): ShipmentTracking {
  const root = Array.isArray(payload) ? payload[0] : payload;
  const trackingData = root?.tracking_data ?? root;
  if (
    !trackingData ||
    trackingData.track_status === 0 ||
    trackingData.error ||
    trackingData.message === 'No data found'
  ) {
    throw new TrackingLookupError(
      'No shipment was found for that tracking reference.',
      'NOT_FOUND',
      404,
    );
  }

  const shipmentTracks = arrayOf(trackingData.shipment_track);
  const shipment = shipmentTracks[0] ?? {};
  const activities = arrayOf<ShiprocketActivity>(
    trackingData.shipment_track_activities ??
      trackingData.scans ??
      root?.scans,
  );
  const events = activities
    .map(normalizeShiprocketActivity)
    .filter((event): event is TrackingEvent => event !== null)
    .sort(
      (left, right) =>
        trackingDateValue(right.happenedAt) - trackingDateValue(left.happenedAt),
    )
    .slice(0, 40);

  const currentStatus = firstUsefulText(
    shipment.current_status,
    trackingData.current_status,
    root?.current_status,
    events[0]?.status,
    'Shipment confirmed',
  );
  const resolvedAwb =
    safeText(shipment.awb_code, 80) ??
    safeText(trackingData.awb, 80) ??
    safeText(root?.awb, 80) ??
    awb;
  const courier = firstUsefulText(
    shipment.courier_name,
    trackingData.courier_name,
    root?.courier_name,
  );
  const eta = firstUsefulText(
    shipment.edd,
    trackingData.etd,
    trackingData.edd,
    root?.etd,
  );

  return {
    source: 'shiprocket',
    mode,
    reference: awb,
    awb: safeText(resolvedAwb, 80),
    courier: safeText(courier, 80),
    currentStatus: safeText(currentStatus, 120) ?? 'Shipment confirmed',
    stage: inferTrackingStage(currentStatus),
    eta: safeText(eta, 80),
    trackingUrl: safeUrl(trackingData.track_url ?? root?.track_url),
    checkedAt: new Date().toISOString(),
    events: events.length
      ? events
      : [
          {
            status: safeText(currentStatus, 120) ?? 'Shipment confirmed',
            detail: 'The carrier has received this shipment reference.',
            happenedAt: safeText(
              shipment.pickup_date ?? shipment.awb_assigned_date,
              80,
            ),
          },
        ],
  };
}

function normalizeShiprocketActivity(
  activity: ShiprocketActivity,
): TrackingEvent | null {
  const status = firstUsefulText(
    activity['sr-status-label'],
    activity.activity,
    activity.status,
  );
  if (!status) return null;
  const detail = firstUsefulText(activity.activity);
  return {
    status: safeText(status, 140) ?? 'Shipment update',
    detail:
      detail && detail.toLowerCase() !== status.toLowerCase()
        ? safeText(detail, 240)
        : null,
    location: safeText(activity.location, 140),
    happenedAt: safeText(activity.date, 80),
  };
}

export function inferTrackingStage(value?: unknown): TrackingStage {
  const status = String(value ?? '').toLowerCase();
  if (/cancel|return|rto|lost|damaged|undelivered|exception/.test(status)) {
    return 'exception';
  }
  if (/delivered/.test(status)) return 'delivered';
  if (/out for delivery|out_for_delivery/.test(status)) {
    return 'out_for_delivery';
  }
  if (/in transit|shipped|picked up|reached|departed|arrived/.test(status)) {
    return 'in_transit';
  }
  if (/processing|packed|ready|manifest|awb|pickup|fulfilled/.test(status)) {
    return 'processing';
  }
  return 'confirmed';
}

function shopifyFulfillmentLabel(status?: string | null) {
  switch (status?.toUpperCase()) {
    case 'FULFILLED':
      return 'Shipped';
    case 'PARTIALLY_FULFILLED':
      return 'Partially shipped';
    case 'IN_PROGRESS':
      return 'Preparing your order';
    case 'ON_HOLD':
      return 'Shipment on hold';
    case 'SCHEDULED':
      return 'Pickup scheduled';
    case 'RESTOCKED':
      return 'Returned';
    default:
      return 'Order confirmed';
  }
}

function normalizeShopDomain(domain?: string | null) {
  return (
    domain
      ?.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '') || null
  );
}

function firstUsefulText(...values: unknown[]) {
  for (const value of values) {
    const text = safeText(value, 240);
    if (text && !/^\d+$/.test(text)) return text;
  }
  return null;
}

function safeText(value: unknown, maximum: number) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, maximum) : null;
}

function safeUrl(value: unknown) {
  const text = safeText(value, 500);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function arrayOf<T = any>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return value && typeof value === 'object' ? [value as T] : [];
}

function trackingDateValue(value?: string | null) {
  if (!value) return 0;
  const parsed = Date.parse(value.replace(' ', 'T'));
  return Number.isFinite(parsed) ? parsed : 0;
}

const SHOPIFY_TRACKING_ORDER_QUERY = `
  query TrackingOrderLookup($query: String!) {
    orders(first: 5, query: $query, reverse: true, sortKey: CREATED_AT) {
      nodes {
        id
        name
        email
        confirmationNumber
        createdAt
        updatedAt
        displayFulfillmentStatus
        customer {
          email
        }
        fulfillments {
          status
          updatedAt
          trackingInfo {
            company
            number
            url
          }
        }
      }
    }
  }
`;
