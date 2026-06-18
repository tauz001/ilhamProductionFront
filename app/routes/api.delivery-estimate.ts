import type {Route} from './+types/api.delivery-estimate';
import {
  isLucknowSameDayPincode,
  SAME_DAY_DELIVERY_FEE_INR,
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
};

let cachedShiprocketToken:
  | {email: string; token: string; expiresAt: number}
  | null = null;

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pincode = url.searchParams.get('pincode')?.trim() ?? '';
  const amount = Number(url.searchParams.get('amount') ?? 0);
  const env = context.env as unknown as ShiprocketEnv;
  const sameDay = getSameDayEstimate(pincode);

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

function getSameDayEstimate(pincode: string) {
  const eligible = isLucknowSameDayPincode(pincode);

  return {
    eligible,
    fee: eligible ? SAME_DAY_DELIVERY_FEE_INR : 0,
    message: eligible
      ? `Same-day Lucknow delivery is available for Rs. ${SAME_DAY_DELIVERY_FEE_INR} extra.`
      : 'Same-day delivery is currently available only for Lucknow 226xxx pincodes.',
  };
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
