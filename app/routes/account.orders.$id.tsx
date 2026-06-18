import {
  Link,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useRouteError,
} from 'react-router';
import type {ReactNode} from 'react';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {
  CUSTOMER_ORDER_FROM_CUSTOMER_QUERY,
  CUSTOMER_ORDER_OWNERSHIP_QUERY,
  CUSTOMER_ORDER_QUERY,
  CUSTOMER_ORDER_SAFE_QUERY,
} from '~/graphql/customer-account/CustomerOrderQuery';
import {
  decodeOrderRouteId,
  getNumericOrderId,
  getOrderGid,
} from '~/lib/customer-account/order-route-id';

type MoneyData = Pick<MoneyV2, 'amount' | 'currencyCode'>;
type TrackingInfo = {
  company?: string | null;
  number?: string | null;
  url?: string | null;
};
type FulfillmentEventNode = {
  id: string;
  status?: string | null;
  happenedAt?: string | null;
  packageStatus?: string | null;
};
type FulfillmentNode = {
  id: string;
  status?: string | null;
  latestShipmentStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  estimatedDeliveryAt?: string | null;
  requiresShipping?: boolean | null;
  trackingInformation?: Array<TrackingInfo> | null;
  events?: {nodes?: Array<FulfillmentEventNode> | null} | null;
  fulfillmentLineItems?: {nodes?: Array<FulfillmentPackageItem> | null} | null;
};
type FulfillmentPackageItem = {
  id: string;
  quantity?: number | null;
  lineItem: {
    id?: string | null;
    title?: string | null;
    variantTitle?: string | null;
    image?: ImageData | null;
  };
};
type ImageData = {
  altText?: string | null;
  height?: number | null;
  url: string;
  id?: string | null;
  width?: number | null;
};
type OrderLineItemForView = {
  id: string;
  title: string;
  quantity: number;
  sku?: string | null;
  requiresShipping?: boolean | null;
  price?: MoneyData | null;
  currentTotalPrice?: MoneyData | null;
  soldTotalPrice?: MoneyData | null;
  totalDiscount?: MoneyData | null;
  image?: ImageData | null;
  variantTitle?: string | null;
};
type DiscountApplicationForView = {
  value?:
    | ({__typename: 'MoneyV2'} & MoneyData)
    | {__typename: 'PricingPercentageValue'; percentage?: number | null}
    | null;
};
type TransactionForView = {
  id: string;
  kind?: string | null;
  status?: string | null;
  type?: string | null;
  processedAt?: string | null;
  transactionAmount?: {presentmentMoney?: MoneyData | null} | null;
};
type LoadedOrder = {
  id: string;
  name?: string | null;
  number?: number | null;
  confirmationNumber?: string | null;
  statusPageUrl?: string | null;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  processedAt?: string | null;
  updatedAt?: string | null;
  requiresShipping?: boolean | null;
  shippingTitle?: string | null;
  fulfillments?: {nodes?: Array<FulfillmentNode> | null} | null;
  totalTax?: MoneyData | null;
  totalShipping?: MoneyData | null;
  totalRefunded?: MoneyData | null;
  totalPrice: MoneyData;
  subtotal?: MoneyData | null;
  shippingAddress?: {
    name?: string | null;
    formatted?: string | Array<string> | null;
    formattedArea?: string | null;
  } | null;
  discountApplications?: {nodes?: Array<DiscountApplicationForView> | null} | null;
  transactions?: Array<TransactionForView> | null;
  lineItems?: {nodes?: Array<OrderLineItemForView> | null} | null;
};
type NormalizedOrderLookup = {
  rawRouteId: string;
  decodedRouteId: string;
  orderId: string;
  numericOrderId: string | null;
};
type OrderLookupResult = {
  data?: {order?: LoadedOrder | null} | null;
  errors?: Array<{message?: string}> | null;
};
type CustomerOwnedOrderLookupResult = {
  data?: {
    customer?: {
      orders?: {nodes?: Array<LoadedOrder> | null} | null;
    } | null;
  } | null;
  errors?: Array<{message?: string}> | null;
};
type CustomerOrderOwnershipLookupResult = {
  data?: {
    customer?: {
      emailAddress?: {emailAddress?: string | null} | null;
      orders?: {nodes?: Array<LoadedOrder> | null} | null;
    } | null;
  } | null;
  errors?: Array<{message?: string}> | null;
};
type OrderRouteEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
};
type AdminMoneySet = {
  shop_money?: {amount?: string | number | null; currency_code?: string | null};
  presentment_money?: {
    amount?: string | number | null;
    currency_code?: string | null;
  };
};
type AdminAddress = {
  name?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
};
type AdminOrder = {
  id?: number | string | null;
  admin_graphql_api_id?: string | null;
  name?: string | null;
  order_number?: number | string | null;
  confirmation_number?: string | null;
  email?: string | null;
  contact_email?: string | null;
  customer?: {email?: string | null} | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  processed_at?: string | null;
  updated_at?: string | null;
  currency?: string | null;
  presentment_currency?: string | null;
  current_total_price?: string | number | null;
  total_price?: string | number | null;
  current_subtotal_price?: string | number | null;
  subtotal_price?: string | number | null;
  current_total_tax?: string | number | null;
  total_tax?: string | number | null;
  total_shipping_price_set?: AdminMoneySet | null;
  total_refunded?: string | number | null;
  total_refunded_set?: AdminMoneySet | null;
  order_status_url?: string | null;
  shipping_lines?: Array<{title?: string | null; price_set?: AdminMoneySet | null}> | null;
  shipping_address?: AdminAddress | null;
  discount_applications?: Array<{
    value?: string | number | null;
    value_type?: string | null;
  }> | null;
  line_items?: Array<{
    id?: number | string | null;
    admin_graphql_api_id?: string | null;
    title?: string | null;
    name?: string | null;
    quantity?: number | null;
    current_quantity?: number | null;
    sku?: string | null;
    requires_shipping?: boolean | null;
    price?: string | number | null;
    price_set?: AdminMoneySet | null;
    total_discount?: string | number | null;
    total_discount_set?: AdminMoneySet | null;
    variant_title?: string | null;
  }> | null;
  fulfillments?: Array<{
    id?: number | string | null;
    admin_graphql_api_id?: string | null;
    status?: string | null;
    shipment_status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    tracking_company?: string | null;
    tracking_number?: string | null;
    tracking_url?: string | null;
    tracking_numbers?: Array<string | null> | null;
    tracking_urls?: Array<string | null> | null;
    line_items?: Array<{
      id?: number | string | null;
      admin_graphql_api_id?: string | null;
      title?: string | null;
      name?: string | null;
      quantity?: number | null;
      variant_title?: string | null;
    }> | null;
  }> | null;
};

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: data?.order?.name ? `Order ${data.order.name}` : 'Order details'}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderLookup = normalizeOrderRouteId(params.id);
  const {orderId} = orderLookup;
  const language = customerAccount.i18n.language;
  const richResult = await queryOrder({
    customerAccount,
    query: CUSTOMER_ORDER_QUERY,
    orderId,
    language,
    label: 'rich',
  });
  const safeResult =
    richResult.data?.order && !richResult.errors?.length
      ? richResult
      : await queryOrder({
          customerAccount,
          query: CUSTOMER_ORDER_SAFE_QUERY,
          orderId,
          language,
          label: 'safe',
        });

  if (!richResult.data?.order || richResult.errors?.length) {
    console.warn('[account-order] Rich order lookup fell back to safe query:', {
      orderId,
      errors: richResult.errors,
    });
  }

  let order = safeResult.data?.order ?? null;
  let lookupErrors = safeResult.errors;

  if (lookupErrors?.length || !order) {
    const customerOwnedResult = await findCustomerOwnedOrder({
      customerAccount,
      language,
      orderLookup,
    });

    order = customerOwnedResult.order;
    lookupErrors = customerOwnedResult.errors;
  }

  if (!order) {
    const ownershipResult = await findCustomerOwnedOrderSummary({
      customerAccount,
      language,
      orderLookup,
    });

    lookupErrors = ownershipResult.errors ?? lookupErrors;

    if (ownershipResult.order) {
      const adminOrder = await fetchAdminOrderForVerifiedCustomer({
        customerEmail: ownershipResult.customerEmail,
        env: context.env as unknown as OrderRouteEnv,
        numericOrderId: orderLookup.numericOrderId,
      });

      // The summary object is already proven customer-owned. The Admin API
      // fallback only enriches it; it never decides ownership by itself.
      order = adminOrder ?? ownershipResult.order;
    }
  }

  if (!order) {
    console.warn('[account-order] Order unavailable for signed-in customer:', {
      orderId,
      routeId: orderLookup.rawRouteId,
      errors: lookupErrors,
    });
    throwOrderUnavailable();
  }

  const lineItems = connectionNodes<OrderLineItemForView>(order.lineItems);
  const fulfillments = connectionNodes<FulfillmentNode>(order.fulfillments);
  const discountApplications = connectionNodes<DiscountApplicationForView>(
    order.discountApplications,
  );
  const fulfillmentStatus =
    order.fulfillmentStatus ?? fulfillments[0]?.status ?? 'UNFULFILLED';
  const trackingInformation = fulfillments.flatMap(
    (fulfillment) => fulfillment.trackingInformation ?? [],
  );
  const fulfillmentEvents = fulfillments
    .flatMap((fulfillment) =>
      connectionNodes<FulfillmentEventNode>(fulfillment.events).map((event) => ({
        ...event,
        packageStatus: fulfillment.status,
      })),
    )
    .filter((event) => event.happenedAt)
    .sort(
      (eventA, eventB) =>
        new Date(eventB.happenedAt ?? 0).getTime() -
        new Date(eventA.happenedAt ?? 0).getTime(),
    );
  const primaryTransaction =
    order.transactions?.find((transaction) => transaction.status === 'SUCCESS') ??
    order.transactions?.[0] ??
    null;
  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage ?? null
      : null;

  return {
    order,
    lineItems,
    fulfillments,
    trackingInformation,
    fulfillmentEvents,
    primaryTransaction,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    fulfillments,
    trackingInformation,
    fulfillmentEvents,
    primaryTransaction,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  const totalQuantity = lineItems.reduce(
    (total, lineItem) => total + lineItem.quantity,
    0,
  );
  const firstTracking = trackingInformation.find(
    (tracking) => tracking.url || tracking.number || tracking.company,
  );
  const latestEvent = fulfillmentEvents[0];

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-8">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 small-caps text-ink/45 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
          Orders
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="small-caps text-ink/45">Order details</p>
            <h2 className="mt-2 font-display text-5xl leading-none text-ink md:text-7xl">
              {order.name ?? (order.number ? `#${order.number}` : 'Order')}
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
              {order.processedAt ? (
                <span>Placed {formatDate(order.processedAt)}</span>
              ) : null}
              {order.confirmationNumber ? (
                <span>Confirmation {order.confirmationNumber}</span>
              ) : null}
              <span>
                {totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {firstTracking?.url ? (
              <a
                target="_blank"
                href={firstTracking.url}
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-ink px-5 small-caps text-[11px] text-ivory transition-colors hover:bg-gold"
              >
                Track shipment
                <ExternalLink className="h-4 w-4" strokeWidth={1.4} />
              </a>
            ) : null}
            {order.statusPageUrl ? (
              <a
                target="_blank"
                href={order.statusPageUrl}
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 border border-border px-5 small-caps text-[11px] text-ink/65 transition-colors hover:border-gold hover:text-gold"
              >
                Shopify status
                <ExternalLink className="h-4 w-4" strokeWidth={1.4} />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          icon={<CreditCard className="h-5 w-5" strokeWidth={1.4} />}
          label="Payment"
          value={formatStatus(order.financialStatus)}
          detail={
            primaryTransaction?.processedAt
              ? `Updated ${formatDate(primaryTransaction.processedAt)}`
              : order.financialStatus
                ? 'Payment status provided by Shopify'
                : 'Payment details recorded by Shopify'
          }
        />
        <SummaryCard
          icon={<PackageCheck className="h-5 w-5" strokeWidth={1.4} />}
          label="Fulfillment"
          value={formatStatus(fulfillmentStatus)}
          detail={
            latestEvent
              ? `${formatStatus(latestEvent.status)} on ${formatDate(
                  latestEvent.happenedAt,
                )}`
              : 'Awaiting carrier movement'
          }
        />
        <SummaryCard
          icon={<Truck className="h-5 w-5" strokeWidth={1.4} />}
          label="Shipping"
          value={order.shippingTitle || 'Standard delivery'}
          detail={
            firstTracking?.number
              ? `${firstTracking.company || 'Carrier'} ${firstTracking.number}`
              : order.requiresShipping === false
                ? 'No physical shipping required'
                : order.requiresShipping
                ? 'Tracking appears after fulfillment'
                : 'Shipping updates appear after fulfillment'
          }
        />
      </section>

      <OrderTimeline
        order={order}
        fulfillments={fulfillments}
        events={fulfillmentEvents}
        trackingInformation={trackingInformation}
        primaryTransactionDate={primaryTransaction?.processedAt}
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <section className="border border-border bg-cream/25">
          <div className="border-b border-border px-6 py-5">
            <p className="small-caps text-ink/45">Pieces ordered</p>
            <h3 className="mt-2 font-display text-4xl text-ink">
              What you ordered
            </h3>
          </div>
          <div className="divide-y divide-border">
            {lineItems.length ? (
              lineItems.map((lineItem) => (
                <OrderLineCard key={lineItem.id} lineItem={lineItem} />
              ))
            ) : (
              <p className="p-6 font-serif text-xl italic text-ink/60">
                Shopify confirmed this order belongs to you. Piece details are
                still syncing for this customer session.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <OrderTotals
            order={order}
            discountValue={discountValue}
            discountPercentage={discountPercentage}
          />
          <ShippingAddressCard order={order} />
          <PaymentCard order={order} />
        </aside>
      </div>

      <FulfillmentPackages fulfillments={fulfillments} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? getRouteErrorMessage(error.data) || 'We could not open that order.'
    : error instanceof Error
      ? error.message
      : 'We could not open that order.';

  return (
    <div className="space-y-8">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 small-caps text-ink/45 transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
        Orders
      </Link>
      <section className="border border-border bg-cream/30 px-6 py-12 text-center">
        <p className="small-caps text-ink/45">Order details</p>
        <h2 className="mt-4 font-display text-4xl text-ink md:text-6xl">
          We could not load this order.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/60">
          {message}
        </p>
        <Link
          to="/account/orders"
          className="mt-8 inline-flex h-12 items-center bg-ink px-6 small-caps text-[11px] text-ivory transition-colors hover:bg-gold"
        >
          Back to orders
        </Link>
      </section>
    </div>
  );
}

function throwOrderUnavailable(): never {
  throw new Response(
    JSON.stringify({
      message:
        'Shopify did not make this order detail available to the current customer session. Open the order from Orders again, or use the Shopify-hosted order status page if the order was just placed. We never show an order unless Shopify confirms it belongs to the signed-in customer.',
    }),
    {
      status: 404,
      headers: {'Content-Type': 'application/json'},
    },
  );
}

function getRouteErrorMessage(data: unknown) {
  if (!data) return '';

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as {message?: unknown};
      return typeof parsed.message === 'string' ? parsed.message : data;
    } catch {
      return data;
    }
  }

  if (typeof data === 'object' && 'message' in data) {
    const message = (data as {message?: unknown}).message;
    return typeof message === 'string' ? message : '';
  }

  return '';
}

function normalizeOrderRouteId(routeId: string): NormalizedOrderLookup {
  let cleanId = routeId.trim();

  try {
    cleanId = decodeURIComponent(cleanId).trim();
  } catch {
    // A hand-edited malformed URL should not crash the account page.
  }

  let decodedRouteId = cleanId;

  if (!cleanId.startsWith('gid://shopify/Order/') && !/^\d+$/.test(cleanId)) {
    try {
      decodedRouteId = decodeOrderRouteId(cleanId);
    } catch {
      // Leave the original value in place so Shopify can reject it safely.
    }
  }

  const orderId = getOrderGid(decodedRouteId);

  return {
    rawRouteId: cleanId,
    decodedRouteId,
    orderId,
    numericOrderId: getNumericOrderId(orderId),
  };
}

async function queryOrder({
  customerAccount,
  label,
  language,
  orderId,
  query,
}: {
  customerAccount: {
    query: (
      query: string,
      options: {variables: {orderId: string; language?: string | null}},
    ) => Promise<OrderLookupResult>;
  };
  label: 'rich' | 'safe';
  language?: string | null;
  orderId: string;
  query: string;
}) {
  try {
    return await customerAccount.query(query, {
      variables: {
        orderId,
        language,
      },
    });
  } catch (error) {
    console.error(`[account-order] ${label} order lookup failed:`, {
      orderId,
      error,
    });

    return {
      data: null,
      errors: [
        {
          message:
            error instanceof Error ? error.message : 'Order lookup failed.',
        },
      ],
    };
  }
}

async function findCustomerOwnedOrder({
  customerAccount,
  language,
  orderLookup,
}: {
  customerAccount: {
    query: (
      query: string,
      options: {
        variables: {
          first: number;
          query?: string | null;
          language?: string | null;
        };
      },
    ) => Promise<CustomerOwnedOrderLookupResult>;
  };
  language?: string | null;
  orderLookup: NormalizedOrderLookup;
}) {
  const searchQueries = orderLookup.numericOrderId
    ? [`id:${orderLookup.numericOrderId}`, null]
    : [null];
  let lastErrors: CustomerOwnedOrderLookupResult['errors'] = null;

  for (const searchQuery of searchQueries) {
    const result = await queryCustomerOwnedOrders({
      customerAccount,
      language,
      searchQuery,
    });
    const customerOrders = connectionNodes<LoadedOrder>(
      result.data?.customer?.orders,
    );
    const order = matchCustomerOwnedOrder(customerOrders, orderLookup);

    if (order) {
      return {
        order,
        errors: null,
      };
    }

    lastErrors = result.errors ?? lastErrors;
  }

  return {
    order: null,
    errors: lastErrors,
  };
}

async function queryCustomerOwnedOrders({
  customerAccount,
  language,
  searchQuery,
}: {
  customerAccount: {
    query: (
      query: string,
      options: {
        variables: {
          first: number;
          query?: string | null;
          language?: string | null;
        };
      },
    ) => Promise<CustomerOwnedOrderLookupResult>;
  };
  language?: string | null;
  searchQuery?: string | null;
}) {
  try {
    return await customerAccount.query(CUSTOMER_ORDER_FROM_CUSTOMER_QUERY, {
      variables: {
        first: 50,
        query: searchQuery,
        language,
      },
    });
  } catch (error) {
    console.error('[account-order] customer-owned order lookup failed:', {
      searchQuery,
      error,
    });

    return {
      data: null,
      errors: [
        {
          message:
            error instanceof Error
              ? error.message
              : 'Customer-owned order lookup failed.',
        },
      ],
    };
  }
}

async function findCustomerOwnedOrderSummary({
  customerAccount,
  language,
  orderLookup,
}: {
  customerAccount: {
    query: (
      query: string,
      options: {
        variables: {
          first: number;
          query?: string | null;
          language?: string | null;
        };
      },
    ) => Promise<CustomerOrderOwnershipLookupResult>;
  };
  language?: string | null;
  orderLookup: NormalizedOrderLookup;
}) {
  const searchQueries = orderLookup.numericOrderId
    ? [`id:${orderLookup.numericOrderId}`, null]
    : [null];
  let lastErrors: CustomerOrderOwnershipLookupResult['errors'] = null;

  for (const searchQuery of searchQueries) {
    const result = await queryCustomerOwnedOrderSummary({
      customerAccount,
      language,
      searchQuery,
    });
    const customer = result.data?.customer;
    const customerOrders = connectionNodes<LoadedOrder>(customer?.orders);
    const order = matchCustomerOwnedOrder(customerOrders, orderLookup);

    if (order) {
      return {
        order,
        customerEmail: customer?.emailAddress?.emailAddress ?? null,
        errors: null,
      };
    }

    lastErrors = result.errors ?? lastErrors;
  }

  return {
    order: null,
    customerEmail: null,
    errors: lastErrors,
  };
}

async function queryCustomerOwnedOrderSummary({
  customerAccount,
  language,
  searchQuery,
}: {
  customerAccount: {
    query: (
      query: string,
      options: {
        variables: {
          first: number;
          query?: string | null;
          language?: string | null;
        };
      },
    ) => Promise<CustomerOrderOwnershipLookupResult>;
  };
  language?: string | null;
  searchQuery?: string | null;
}) {
  try {
    return await customerAccount.query(CUSTOMER_ORDER_OWNERSHIP_QUERY, {
      variables: {
        first: 50,
        query: searchQuery,
        language,
      },
    });
  } catch (error) {
    console.error('[account-order] ownership order lookup failed:', {
      searchQuery,
      error,
    });

    return {
      data: null,
      errors: [
        {
          message:
            error instanceof Error
              ? error.message
              : 'Customer-owned order summary lookup failed.',
        },
      ],
    };
  }
}

async function fetchAdminOrderForVerifiedCustomer({
  customerEmail,
  env,
  numericOrderId,
}: {
  customerEmail?: string | null;
  env: OrderRouteEnv;
  numericOrderId?: string | null;
}) {
  if (!numericOrderId) return null;

  const shopDomain = normalizeShopDomain(env.PUBLIC_STORE_DOMAIN);
  const adminToken = env.PRIVATE_SHOPIFY_ADMIN_API_TOKEN;

  if (!shopDomain || !adminToken) {
    console.warn(
      '[account-order] Admin API order enrichment skipped: missing private configuration.',
    );
    return null;
  }

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2026-01/orders/${numericOrderId}.json`,
      {
        headers: {
          Accept: 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      order?: AdminOrder | null;
      errors?: unknown;
    };

    if (!response.ok || !payload.order) {
      console.warn('[account-order] Admin API order enrichment failed:', {
        status: response.status,
        numericOrderId,
        errors: payload.errors,
      });
      return null;
    }

    if (!adminOrderBelongsToCustomer(payload.order, customerEmail)) {
      console.warn('[account-order] Admin order email did not match customer:', {
        numericOrderId,
      });
      return null;
    }

    return mapAdminOrderToLoadedOrder(payload.order);
  } catch (error) {
    console.error('[account-order] Admin API order enrichment crashed:', {
      numericOrderId,
      error,
    });
    return null;
  }
}

function mapAdminOrderToLoadedOrder(order: AdminOrder): LoadedOrder | null {
  const numericId = toStringId(order.id);
  if (!numericId) return null;

  const currencyCode = order.presentment_currency ?? order.currency ?? 'INR';
  const subtotal =
    adminMoney(order.current_subtotal_price ?? order.subtotal_price, currencyCode) ??
    null;
  const totalShipping =
    adminMoneyFromSet(order.total_shipping_price_set, currencyCode) ??
    adminMoneyFromSet(order.shipping_lines?.[0]?.price_set, currencyCode) ??
    null;
  const totalTax =
    adminMoney(order.current_total_tax ?? order.total_tax, currencyCode) ?? null;
  const totalRefunded =
    adminMoneyFromSet(order.total_refunded_set, currencyCode) ??
    adminMoney(order.total_refunded, currencyCode) ??
    null;
  const totalPrice =
    adminMoney(order.current_total_price ?? order.total_price, currencyCode) ??
    subtotal ??
    zeroMoney(currencyCode);

  return {
    id: order.admin_graphql_api_id ?? getOrderGid(numericId),
    name: order.name,
    number: numberOrNull(order.order_number),
    confirmationNumber: order.confirmation_number,
    statusPageUrl: order.order_status_url,
    financialStatus: normalizeAdminStatus(order.financial_status),
    fulfillmentStatus: normalizeAdminStatus(order.fulfillment_status ?? 'unfulfilled'),
    processedAt: order.processed_at,
    updatedAt: order.updated_at,
    requiresShipping: Boolean(order.shipping_address || order.shipping_lines?.length),
    shippingTitle: order.shipping_lines?.[0]?.title ?? null,
    fulfillments: {nodes: mapAdminFulfillments(order.fulfillments)},
    totalTax,
    totalShipping,
    totalRefunded,
    totalPrice,
    subtotal,
    shippingAddress: mapAdminAddress(order.shipping_address),
    discountApplications: {
      nodes: mapAdminDiscountApplications(order.discount_applications, currencyCode),
    },
    transactions: [],
    lineItems: {
      nodes: mapAdminLineItems(order.line_items, currencyCode),
    },
  };
}

function mapAdminLineItems(
  lineItems: AdminOrder['line_items'],
  currencyCode: string,
): Array<OrderLineItemForView> {
  return (lineItems ?? []).map((lineItem, index) => {
    const price =
      adminMoneyFromSet(lineItem.price_set, currencyCode) ??
      adminMoney(lineItem.price, currencyCode);
    const totalDiscount =
      adminMoneyFromSet(lineItem.total_discount_set, currencyCode) ??
      adminMoney(lineItem.total_discount, currencyCode);
    const quantity =
      lineItem.current_quantity ?? lineItem.quantity ?? 0;
    const currentTotalPrice = price
      ? moneyFromNumber(
          Math.max(
            0,
            Number(price.amount) * quantity - Number(totalDiscount?.amount ?? 0),
          ),
          price.currencyCode,
        )
      : null;

    return {
      id: toStringId(lineItem.admin_graphql_api_id ?? lineItem.id) ?? `line-${index}`,
      title: lineItem.title ?? lineItem.name ?? 'ilham piece',
      quantity,
      sku: lineItem.sku,
      requiresShipping: lineItem.requires_shipping,
      price,
      currentTotalPrice,
      soldTotalPrice: currentTotalPrice,
      totalDiscount,
      image: null,
      variantTitle: lineItem.variant_title,
    };
  });
}

function mapAdminFulfillments(
  fulfillments: AdminOrder['fulfillments'],
): Array<FulfillmentNode> {
  return (fulfillments ?? []).map((fulfillment, index) => {
    const trackingNumbers = fulfillment.tracking_numbers?.filter(Boolean) ?? [];
    const trackingUrls = fulfillment.tracking_urls?.filter(Boolean) ?? [];
    const trackingInformation =
      trackingNumbers.length || trackingUrls.length
        ? Array.from(
            {length: Math.max(trackingNumbers.length, trackingUrls.length)},
            (_, trackingIndex) => ({
              company: fulfillment.tracking_company,
              number: trackingNumbers[trackingIndex] ?? fulfillment.tracking_number,
              url: trackingUrls[trackingIndex] ?? fulfillment.tracking_url,
            }),
          )
        : [
            {
              company: fulfillment.tracking_company,
              number: fulfillment.tracking_number,
              url: fulfillment.tracking_url,
            },
          ];

    return {
      id: toStringId(fulfillment.admin_graphql_api_id ?? fulfillment.id) ??
        `fulfillment-${index}`,
      status: normalizeAdminStatus(fulfillment.status),
      latestShipmentStatus: normalizeAdminStatus(fulfillment.shipment_status),
      createdAt: fulfillment.created_at,
      updatedAt: fulfillment.updated_at,
      requiresShipping: true,
      trackingInformation,
      events: {nodes: []},
      fulfillmentLineItems: {
        nodes: (fulfillment.line_items ?? []).map((lineItem, lineIndex) => ({
          id: toStringId(lineItem.admin_graphql_api_id ?? lineItem.id) ??
            `fulfillment-line-${index}-${lineIndex}`,
          quantity: lineItem.quantity,
          lineItem: {
            id: toStringId(lineItem.admin_graphql_api_id ?? lineItem.id),
            title: lineItem.title ?? lineItem.name,
            variantTitle: lineItem.variant_title,
            image: null,
          },
        })),
      },
    };
  });
}

function mapAdminDiscountApplications(
  discountApplications: AdminOrder['discount_applications'],
  currencyCode: string,
): Array<DiscountApplicationForView> {
  return (discountApplications ?? []).map((discountApplication) => {
    if (discountApplication.value_type === 'percentage') {
      return {
        value: {
          __typename: 'PricingPercentageValue',
          percentage: numberOrNull(discountApplication.value),
        },
      };
    }

    const value = adminMoney(discountApplication.value, currencyCode);
    return {
      value: value ? {__typename: 'MoneyV2', ...value} : null,
    };
  });
}

function mapAdminAddress(address?: AdminAddress | null) {
  if (!address) return null;

  return {
    name: address.name,
    formatted: formatAdminAddress(address),
    formattedArea: [address.city, address.province, address.zip]
      .filter(Boolean)
      .join(', '),
  };
}

function adminOrderBelongsToCustomer(
  order: AdminOrder,
  customerEmail?: string | null,
) {
  const expectedEmail = normalizeEmail(customerEmail);
  if (!expectedEmail) return true;

  return [order.email, order.contact_email, order.customer?.email]
    .map(normalizeEmail)
    .some((email) => email === expectedEmail);
}

function normalizeShopDomain(domain?: string | null) {
  const cleanDomain = domain
    ?.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');

  return cleanDomain || null;
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

function formatAdminAddress(address: AdminAddress) {
  const lines = [
    address.address1,
    address.address2,
    [address.city, address.province, address.zip].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);

  return lines.length ? lines : null;
}

function adminMoneyFromSet(
  moneySet?: AdminMoneySet | null,
  fallbackCurrencyCode = 'INR',
) {
  const money = moneySet?.presentment_money ?? moneySet?.shop_money;
  return adminMoney(money?.amount, money?.currency_code ?? fallbackCurrencyCode);
}

function adminMoney(
  amount?: string | number | null,
  currencyCode = 'INR',
): MoneyData | null {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return null;

  return moneyFromNumber(numericAmount, currencyCode);
}

function moneyFromNumber(amount: number, currencyCode = 'INR'): MoneyData {
  return {
    amount: amount.toFixed(2),
    currencyCode: currencyCode as MoneyData['currencyCode'],
  };
}

function zeroMoney(currencyCode = 'INR'): MoneyData {
  return moneyFromNumber(0, currencyCode);
}

function numberOrNull(value?: string | number | null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function toStringId(value?: string | number | null) {
  if (value === null || value === undefined) return null;

  const id = String(value).trim();
  return id || null;
}

function normalizeAdminStatus(value?: string | null) {
  return value ? value.toUpperCase().replace(/\s+/g, '_') : null;
}

function matchCustomerOwnedOrder(
  orders: Array<LoadedOrder>,
  orderLookup: NormalizedOrderLookup,
) {
  const cleanRouteId = orderLookup.rawRouteId.replace(/^#/, '');

  return orders.find((order) => {
    const candidateNumericId = getNumericOrderId(order.id);

    if (
      orderLookup.numericOrderId &&
      candidateNumericId === orderLookup.numericOrderId
    ) {
      return true;
    }

    if (order.id === orderLookup.orderId || order.id === orderLookup.decodedRouteId) {
      return true;
    }

    if (order.number && String(order.number) === cleanRouteId) {
      return true;
    }

    return order.name?.replace(/^#/, '') === cleanRouteId;
  });
}

function connectionNodes<T>(connection?: {nodes?: Array<T> | null} | null) {
  return connection?.nodes ?? [];
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-border bg-cream/30 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="small-caps text-ink/45">{label}</p>
        <span className="grid h-10 w-10 place-items-center border border-border bg-ivory text-gold">
          {icon}
        </span>
      </div>
      <p className="mt-5 font-serif text-2xl text-ink">{value}</p>
      <p className="mt-2 text-sm text-ink/55">{detail}</p>
    </div>
  );
}

function OrderTimeline({
  order,
  fulfillments,
  events,
  trackingInformation,
  primaryTransactionDate,
}: {
  order: LoadedOrder;
  fulfillments: Array<FulfillmentNode>;
  events: Array<FulfillmentEventNode>;
  trackingInformation: Array<TrackingInfo>;
  primaryTransactionDate?: string | null;
}) {
  const firstFulfillment = fulfillments[0];
  const latestInTransit = events.find((event) =>
    ['IN_TRANSIT', 'CARRIER_PICKED_UP', 'OUT_FOR_DELIVERY'].includes(
      event.status ?? '',
    ),
  );
  const deliveredEvent = events.find((event) => event.status === 'DELIVERED');
  const estimatedDelivery = fulfillments.find(
    (fulfillment) => fulfillment.estimatedDeliveryAt,
  )?.estimatedDeliveryAt;
  const hasTracking = trackingInformation.some(
    (tracking) => tracking.url || tracking.number || tracking.company,
  );

  const steps = [
    {
      label: 'Order placed',
      detail: 'Your order was received by ilham.',
      date: order.processedAt,
      active: true,
      icon: <ReceiptText className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: 'Payment',
      detail: formatStatus(order.financialStatus),
      date: primaryTransactionDate ?? order.processedAt,
      active: Boolean(order.financialStatus && order.financialStatus !== 'PENDING'),
      icon: <CreditCard className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: firstFulfillment ? 'Packed' : 'Preparing',
      detail: firstFulfillment
        ? formatStatus(firstFulfillment.status)
        : 'The atelier is preparing your pieces.',
      date: firstFulfillment?.createdAt,
      active: Boolean(firstFulfillment),
      icon: <PackageCheck className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: latestInTransit ? 'In transit' : 'Tracking',
      detail: latestInTransit
        ? formatStatus(latestInTransit.status)
        : hasTracking
          ? 'Carrier tracking is available.'
          : 'Tracking will appear once the carrier updates.',
      date: latestInTransit?.happenedAt,
      active: Boolean(latestInTransit || hasTracking),
      icon: <Truck className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: deliveredEvent ? 'Delivered' : 'Delivery',
      detail: deliveredEvent
        ? 'Delivered to the address on this order.'
        : estimatedDelivery
          ? `Estimated ${formatDate(estimatedDelivery)}`
          : 'Awaiting delivery update.',
      date: deliveredEvent?.happenedAt ?? estimatedDelivery,
      active: Boolean(deliveredEvent),
      icon: deliveredEvent ? (
        <Check className="h-5 w-5" strokeWidth={1.4} />
      ) : (
        <Clock className="h-5 w-5" strokeWidth={1.4} />
      ),
    },
  ];

  return (
    <section className="border border-border bg-ivory">
      <div className="border-b border-border px-6 py-5">
        <p className="small-caps text-ink/45">Delivery timeline</p>
        <h3 className="mt-2 font-display text-4xl text-ink">
          From atelier to doorstep
        </h3>
      </div>
      <ol className="grid gap-3 p-4 md:grid-cols-5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={[
              'border p-4 transition-colors',
              step.active
                ? 'border-gold/60 bg-cream/45 text-ink'
                : 'border-border bg-cream/15 text-ink/45',
            ].join(' ')}
          >
            <span
              className={[
                'grid h-11 w-11 place-items-center border',
                step.active
                  ? 'border-gold bg-gold text-ivory'
                  : 'border-border bg-ivory text-ink/40',
              ].join(' ')}
            >
              {step.icon}
            </span>
            <p className="mt-4 small-caps text-[11px]">{step.label}</p>
            <p className="mt-2 min-h-10 text-sm leading-relaxed">
              {step.detail}
            </p>
            {step.date ? (
              <p className="mt-4 text-xs text-ink/45">{formatDate(step.date)}</p>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="border-t border-border px-6 py-5">
        {events.length ? (
          <div className="space-y-4">
            {events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="grid gap-2 border-l border-gold/50 pl-4 md:grid-cols-[180px_1fr]"
              >
                <p className="small-caps text-ink/45">
                  {formatDate(event.happenedAt)}
                </p>
                <div>
                  <p className="font-serif text-xl text-ink">
                    {formatStatus(event.status)}
                  </p>
                  {event.packageStatus ? (
                    <p className="text-sm text-ink/55">
                      Package status {formatStatus(event.packageStatus)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-serif text-xl italic text-ink/60">
            Carrier timeline updates will appear here after fulfillment.
          </p>
        )}
      </div>
    </section>
  );
}

function OrderLineCard({lineItem}: {lineItem: OrderLineItemForView}) {
  const lineTotal =
    lineItem.currentTotalPrice ?? lineItem.soldTotalPrice ?? lineItem.price;
  const totalDiscount = lineItem.totalDiscount ?? null;
  const hasDiscount = hasPositiveMoney(totalDiscount);

  return (
    <article className="grid gap-5 p-5 md:grid-cols-[96px_1fr_auto] md:items-center">
      <div className="h-24 w-24 overflow-hidden bg-cream">
        {lineItem.image ? (
          <Image
            data={lineItem.image}
            width={120}
            height={120}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-gold">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.3} />
          </div>
        )}
      </div>

      <div>
        <p className="font-serif text-2xl text-ink">{lineItem.title}</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/50">
          {lineItem.variantTitle ? <span>{lineItem.variantTitle}</span> : null}
          {lineItem.sku ? <span>SKU {lineItem.sku}</span> : null}
          <span>Qty {lineItem.quantity}</span>
          <span>{lineItem.requiresShipping ? 'Ships' : 'Digital item'}</span>
        </div>
      </div>

      <div className="grid gap-2 text-left md:text-right">
        <p className="font-display text-3xl text-ink">
          {lineTotal ? <Money data={lineTotal} /> : null}
        </p>
        <p className="text-sm text-ink/50">
          Unit {lineItem.price ? <Money data={lineItem.price} /> : null}
        </p>
        {hasDiscount && totalDiscount ? (
          <p className="text-sm text-gold">
            Discount -<Money data={totalDiscount} />
          </p>
        ) : null}
      </div>
    </article>
  );
}

function OrderTotals({
  order,
  discountValue,
  discountPercentage,
}: {
  order: LoadedOrder;
  discountValue: MoneyData | null;
  discountPercentage: number | null;
}) {
  const totalRefunded = order.totalRefunded ?? null;

  return (
    <section className="border border-border bg-cream/30 p-6">
      <p className="small-caps text-ink/45">Payment summary</p>
      <div className="mt-5 space-y-3">
        {order.subtotal ? <TotalRow label="Subtotal" money={order.subtotal} /> : null}
        {discountPercentage || discountValue ? (
          <TotalRow
            label="Discounts"
            customValue={
              discountPercentage ? (
                <span>-{discountPercentage}%</span>
              ) : discountValue ? (
                <span>
                  -<Money data={discountValue} />
                </span>
              ) : null
            }
          />
        ) : null}
        {order.totalShipping ? (
          <TotalRow
            label={order.shippingTitle || 'Shipping'}
            money={order.totalShipping}
          />
        ) : (
          <TotalRow
            label="Shipping"
            customValue={<span>Shown on Shopify status</span>}
          />
        )}
        {order.totalTax ? <TotalRow label="Tax" money={order.totalTax} /> : null}
        {hasPositiveMoney(totalRefunded) && totalRefunded ? (
          <TotalRow
            label="Refunded"
            customValue={
              <span>
                -<Money data={totalRefunded} />
              </span>
            }
          />
        ) : null}
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-ink pt-5">
        <span className="small-caps text-ink">Total</span>
        <span className="font-display text-4xl text-ink">
          <Money data={order.totalPrice} />
        </span>
      </div>
    </section>
  );
}

function TotalRow({
  label,
  money,
  customValue,
}: {
  label: string;
  money?: MoneyData | null;
  customValue?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 text-sm">
      <span className="text-ink/55">{label}</span>
      <span className="font-serif text-lg text-ink">
        {customValue ?? (money ? <Money data={money} /> : null)}
      </span>
    </div>
  );
}

function ShippingAddressCard({order}: {order: LoadedOrder}) {
  const addressLines = normalizeAddressLines(order.shippingAddress?.formatted);

  return (
    <section className="border border-border bg-cream/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="small-caps text-ink/45">Ship to</p>
        <MapPin className="h-5 w-5 text-gold" strokeWidth={1.4} />
      </div>
      {order.shippingAddress ? (
        <address className="mt-5 space-y-2 font-serif text-xl not-italic text-ink/75">
          {order.shippingAddress.name ? <p>{order.shippingAddress.name}</p> : null}
          {addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {order.shippingAddress.formattedArea ? (
            <p>{order.shippingAddress.formattedArea}</p>
          ) : null}
        </address>
      ) : (
        <p className="mt-5 font-serif text-xl italic text-ink/60">
          No shipping address defined.
        </p>
      )}
    </section>
  );
}

function PaymentCard({order}: {order: LoadedOrder}) {
  const transactions = order.transactions?.slice(0, 3) ?? [];

  return (
    <section className="border border-border bg-cream/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="small-caps text-ink/45">Transactions</p>
        <CreditCard className="h-5 w-5 text-gold" strokeWidth={1.4} />
      </div>
      <div className="mt-5 space-y-4">
        {transactions.length ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border-b border-border pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-serif text-xl text-ink">
                  {formatStatus(transaction.kind ?? transaction.type)}
                </span>
                <span className="small-caps text-gold">
                  {formatStatus(transaction.status)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4 text-sm text-ink/55">
                <span>
                  {transaction.processedAt
                    ? formatDate(transaction.processedAt)
                    : 'Recorded'}
                </span>
                <span className="font-serif text-lg text-ink">
                  {transaction.transactionAmount?.presentmentMoney ? (
                    <Money data={transaction.transactionAmount.presentmentMoney} />
                  ) : null}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="font-serif text-xl italic text-ink/60">
            Payment details are not available yet.
          </p>
        )}
      </div>
    </section>
  );
}

function FulfillmentPackages({
  fulfillments,
}: {
  fulfillments: Array<FulfillmentNode>;
}) {
  return (
    <section className="border border-border bg-cream/20">
      <div className="border-b border-border px-6 py-5">
        <p className="small-caps text-ink/45">Packages</p>
        <h3 className="mt-2 font-display text-4xl text-ink">
          Shipment details
        </h3>
      </div>

      {fulfillments.length ? (
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {fulfillments.map((fulfillment, index) => {
            const tracking = fulfillment.trackingInformation?.[0];
            const packageItems = connectionNodes<FulfillmentPackageItem>(
              fulfillment.fulfillmentLineItems,
            );

            return (
              <article key={fulfillment.id} className="border border-border bg-ivory p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="small-caps text-ink/45">Package {index + 1}</p>
                    <p className="mt-2 font-serif text-2xl text-ink">
                      {formatStatus(fulfillment.status)}
                    </p>
                  </div>
                  {tracking?.url ? (
                    <a
                      href={tracking.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 border border-border px-4 small-caps text-[11px] text-ink/65 transition-colors hover:border-gold hover:text-gold"
                    >
                      Track
                      <ExternalLink className="h-4 w-4" strokeWidth={1.4} />
                    </a>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-ink/55">
                  {fulfillment.createdAt ? (
                    <PackageMeta label="Created" value={formatDate(fulfillment.createdAt)} />
                  ) : null}
                  {fulfillment.estimatedDeliveryAt ? (
                    <PackageMeta
                      label="Estimated"
                      value={formatDate(fulfillment.estimatedDeliveryAt)}
                    />
                  ) : null}
                  {tracking?.company || tracking?.number ? (
                    <PackageMeta
                      label={tracking.company || 'Tracking'}
                      value={tracking.number || 'Available'}
                    />
                  ) : null}
                </div>

                {packageItems.length ? (
                  <div className="mt-5 border-t border-border pt-4">
                    {packageItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 text-sm text-ink/65"
                      >
                        {item.lineItem.image ? (
                          <Image
                            data={item.lineItem.image}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <span className="grid h-12 w-12 place-items-center bg-cream text-gold">
                            <ShoppingBag className="h-5 w-5" strokeWidth={1.3} />
                          </span>
                        )}
                        <span className="flex-1">{item.lineItem.title}</span>
                        {item.quantity ? <span>Qty {item.quantity}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-10">
          <p className="font-serif text-xl italic text-ink/60">
            Package details will appear once this order is fulfilled.
          </p>
        </div>
      )}
    </section>
  );
}

function PackageMeta({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="small-caps text-ink/45">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatStatus(value?: string | null) {
  if (!value) return 'Not available';

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function hasPositiveMoney(money?: {amount: string} | null) {
  return Number(money?.amount ?? 0) > 0;
}

function normalizeAddressLines(
  formatted?: string | Array<string> | null,
): Array<string> {
  if (!formatted) return [];

  return Array.isArray(formatted) ? formatted : [formatted];
}
