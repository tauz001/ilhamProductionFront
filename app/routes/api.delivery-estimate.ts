import type {Route} from './+types/api.delivery-estimate';
import {
  DEFAULT_SAME_DAY_DELIVERY_FEE_INR,
  isSameDayDeliveryPincode,
} from '~/lib/commerce/product-guidance';

type ShiprocketCourier = {
  courier_name?: string;
  cod?: number | boolean;
  cod_charges?: number;
  etd?: string;
  estimated_delivery_days?: string | number;
  estimated_delivery_date?: string;
  min_delivery_days?: string | number;
  max_delivery_days?: string | number;
};

type ShiprocketEnv = {
  SHIPROCKET_API_TOKEN?: string;
  SHIPROCKET_DEFAULT_WEIGHT_KG?: string;
  SHIPROCKET_EMAIL?: string;
  SHIPROCKET_PASSWORD?: string;
  SHIPROCKET_PICKUP_POSTCODE?: string;
  SAME_DAY_DELIVERY_ENABLED?: string;
  SAME_DAY_DELIVERY_FEE_INR?: string;
  SAME_DAY_DELIVERY_PINCODE_PREFIXES?: string;
  SAME_DAY_DELIVERY_VARIANT_ID?: string;
};

let cachedShiprocketToken:
  | {email: string; token: string; expiresAt: number}
  | null = null;

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pincode = url.searchParams.get('pincode')?.trim() ?? '';
  const amount = Number(url.searchParams.get('amount') ?? 0);
  const env = context.env as unknown as ShiprocketEnv;

  if (!/^\d{6}$/.test(pincode)) {
    return json(
      {
        configured: isShiprocketConfigured(env),
        serviceable: false,
        message: 'Enter a valid 6-digit pincode.',
      },
      400,
    );
  }

  const sameDay = await getSameDayEstimate({
    context,
    env,
    pincode,
  });

  if (!isShiprocketConfigured(env)) {
    return json({
      configured: false,
      serviceable: undefined,
      message: 'Delivery timelines are confirmed at checkout for your pincode.',
      estimate: {checkedPincode: pincode, sameDay},
    });
  }

  try {
    const token = await getShiprocketToken(env);
    const serviceabilityUrl = buildServiceabilityUrl({
      env,
      amount,
      deliveryPincode: pincode,
    });

    const response = await fetch(serviceabilityUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = (await response.json().catch(() => ({}))) as any;

    if (!response.ok) {
      console.error('[delivery-estimate] Shiprocket serviceability failed:', {
        status: response.status,
        payload,
      });
      return json(
        {
          configured: true,
          serviceable: false,
          message: 'Could not check this pincode right now.',
          estimate: {checkedPincode: pincode, sameDay},
        },
        502,
      );
    }

    const couriers = getCourierCompanies(payload);
    const bestCourier = couriers[0];
    const etaText = bestCourier ? getEtaText(bestCourier) : '';

    return json({
      configured: true,
      serviceable: couriers.length > 0,
      message: couriers.length
        ? 'Delivery is available for this pincode.'
        : 'Delivery is not available for this pincode yet. Try another pincode.',
      estimate: {
        checkedPincode: pincode,
        courier: bestCourier?.courier_name,
        codAvailable: couriers.some((courier) => Boolean(courier.cod)),
        prepaidAvailable: couriers.length > 0,
        etaText,
        sameDay,
      },
    });
  } catch (error) {
    console.error('[delivery-estimate] Shiprocket estimate failed:', error);
    return json(
      {
        configured: true,
        serviceable: false,
        message: 'Could not check this pincode right now.',
        estimate: {checkedPincode: pincode, sameDay},
      },
      502,
    );
  }
}

async function getSameDayEstimate({
  context,
  env,
  pincode,
}: {
  context: Route.LoaderArgs['context'];
  env: ShiprocketEnv;
  pincode: string;
}) {
  const enabled = env.SAME_DAY_DELIVERY_ENABLED?.toLowerCase() !== 'false';
  const prefixes = env.SAME_DAY_DELIVERY_PINCODE_PREFIXES || '226';
  const eligible = enabled && isSameDayDeliveryPincode(pincode, prefixes);
  const configuredFee = positiveNumber(
    env.SAME_DAY_DELIVERY_FEE_INR,
    DEFAULT_SAME_DAY_DELIVERY_FEE_INR,
  );
  const variant =
    eligible && env.SAME_DAY_DELIVERY_VARIANT_ID
      ? await loadSameDayVariant(context, env.SAME_DAY_DELIVERY_VARIANT_ID)
      : null;
  const fee = Number(variant?.price?.amount ?? configuredFee);
  const currencyCode = variant?.price?.currencyCode ?? 'INR';

  return {
    eligible,
    configured: Boolean(variant),
    fee: eligible ? fee : 0,
    currencyCode,
    variant,
    message: eligible
      ? variant
        ? `Same-day Lucknow delivery is available for ${formatFee(fee, currencyCode)} extra.`
        : `Same-day Lucknow delivery is eligible for this pincode. The paid add-on is awaiting Shopify configuration.`
      : `Same-day delivery is currently available for configured Lucknow pincodes (${prefixes.replace(/,/g, ', ')}xxx).`,
  };
}

async function loadSameDayVariant(
  context: Route.LoaderArgs['context'],
  variantId: string,
) {
  try {
    const result = await context.storefront.query(SAME_DAY_VARIANT_QUERY, {
      cache: context.storefront.CacheShort(),
      variables: {id: variantId},
    });
    const variant = result.node?.__typename === 'ProductVariant' ? result.node : null;
    return variant?.availableForSale ? variant : null;
  } catch (error) {
    console.error('[delivery-estimate] Same-day Shopify variant lookup failed:', error);
    return null;
  }
}

function positiveNumber(value: string | undefined, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function formatFee(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rs. ${amount}`;
  }
}

function isShiprocketConfigured(env: ShiprocketEnv) {
  return Boolean(
    env.SHIPROCKET_PICKUP_POSTCODE &&
      (env.SHIPROCKET_API_TOKEN ||
        (env.SHIPROCKET_EMAIL && env.SHIPROCKET_PASSWORD)),
  );
}

async function getShiprocketToken(env: ShiprocketEnv) {
  if (env.SHIPROCKET_API_TOKEN) return env.SHIPROCKET_API_TOKEN;
  const email = env.SHIPROCKET_EMAIL ?? '';

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
      body: JSON.stringify({
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD,
      }),
    },
  );
  const payload = (await response.json().catch(() => ({}))) as {token?: string};

  if (!response.ok || !payload.token) {
    throw new Error('Shiprocket authentication failed.');
  }

  cachedShiprocketToken = {
    email,
    token: payload.token,
    expiresAt: Date.now() + 20 * 60 * 1000,
  };

  return payload.token;
}

function buildServiceabilityUrl({
  env,
  amount,
  deliveryPincode,
}: {
  env: ShiprocketEnv;
  amount: number;
  deliveryPincode: string;
}) {
  const serviceabilityUrl = new URL(
    'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
  );
  const weight = Number(env.SHIPROCKET_DEFAULT_WEIGHT_KG ?? 0.5);
  const declaredValue = Number.isFinite(amount) && amount > 0 ? amount : 1;

  serviceabilityUrl.searchParams.set(
    'pickup_postcode',
    env.SHIPROCKET_PICKUP_POSTCODE ?? '',
  );
  serviceabilityUrl.searchParams.set('delivery_postcode', deliveryPincode);
  serviceabilityUrl.searchParams.set('cod', '0');
  serviceabilityUrl.searchParams.set('weight', String(weight));
  serviceabilityUrl.searchParams.set('declared_value', String(declaredValue));

  return serviceabilityUrl;
}

function getCourierCompanies(payload: any): ShiprocketCourier[] {
  const couriers =
    payload?.data?.available_courier_companies ??
    payload?.available_courier_companies ??
    [];

  return Array.isArray(couriers)
    ? [...(couriers as ShiprocketCourier[])].sort(
        (a, b) => getDeliveryDayScore(a) - getDeliveryDayScore(b),
      )
    : [];
}

function getDeliveryDayScore(courier: ShiprocketCourier) {
  const candidates = [
    courier.min_delivery_days,
    courier.estimated_delivery_days,
    courier.max_delivery_days,
  ]
    .map((value) => Number.parseFloat(String(value ?? '')))
    .filter((value) => Number.isFinite(value) && value > 0);

  return candidates.length ? Math.min(...candidates) : Number.MAX_SAFE_INTEGER;
}

function getEtaText(courier: ShiprocketCourier) {
  if (courier.etd) return `Estimated delivery ${courier.etd}`;
  if (courier.estimated_delivery_date) {
    return `Estimated delivery ${courier.estimated_delivery_date}`;
  }
  if (courier.estimated_delivery_days) {
    return `Estimated delivery in ${courier.estimated_delivery_days} days`;
  }
  if (courier.min_delivery_days || courier.max_delivery_days) {
    const minDays = courier.min_delivery_days ?? courier.max_delivery_days;
    const maxDays = courier.max_delivery_days ?? courier.min_delivery_days;
    return `Estimated delivery in ${minDays}-${maxDays} days`;
  }

  return 'Estimated delivery is confirmed after checkout address selection.';
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=60',
    },
  });
}

const SAME_DAY_VARIANT_QUERY = `#graphql
  query SameDayDeliveryVariant($id: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    node(id: $id) {
      __typename
      ... on ProductVariant {
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
    }
  }
` as const;
