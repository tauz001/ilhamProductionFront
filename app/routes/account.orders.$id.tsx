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
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {decodeOrderRouteId} from '~/lib/customer-account/order-route-id';

type LoadedOrder = NonNullable<OrderQuery['order']>;
type FulfillmentNode = LoadedOrder['fulfillments']['nodes'][number];
type FulfillmentEventNode = FulfillmentNode['events']['nodes'][number] & {
  packageStatus?: FulfillmentNode['status'];
};
type TrackingInfo = FulfillmentNode['trackingInformation'][number];
type MoneyData = LoadedOrder['totalPrice'];

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  let orderId: string;
  try {
    orderId = decodeOrderRouteId(params.id);
  } catch {
    return redirect('/account/orders');
  }
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const fulfillments = order.fulfillments.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus =
    order.fulfillmentStatus ?? fulfillments[0]?.status ?? 'UNFULFILLED';
  const trackingInformation = fulfillments.flatMap(
    (fulfillment) => fulfillment.trackingInformation ?? [],
  );
  const fulfillmentEvents = fulfillments
    .flatMap((fulfillment) =>
      fulfillment.events.nodes.map((event) => ({
        ...event,
        packageStatus: fulfillment.status,
      })),
    )
    .sort(
      (eventA, eventB) =>
        new Date(eventB.happenedAt).getTime() -
        new Date(eventA.happenedAt).getTime(),
    );
  const primaryTransaction =
    order.transactions.find((transaction) => transaction.status === 'SUCCESS') ??
    order.transactions[0] ??
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
        ).percentage
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
              {order.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
              <span>Placed {formatDate(order.processedAt)}</span>
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
              : 'Payment details recorded'
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
              : order.requiresShipping
                ? 'Tracking appears after fulfillment'
                : 'No physical shipping required'
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
            {lineItems.map((lineItem) => (
              <OrderLineCard key={lineItem.id} lineItem={lineItem} />
            ))}
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
    ? error.data?.message || 'We could not open that order.'
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
      event.status,
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
      active: order.financialStatus !== 'PENDING',
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

function OrderLineCard({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const lineTotal =
    lineItem.currentTotalPrice ?? lineItem.soldTotalPrice ?? lineItem.price;
  const hasDiscount = hasPositiveMoney(lineItem.totalDiscount);

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
        {hasDiscount ? (
          <p className="text-sm text-gold">
            Discount -<Money data={lineItem.totalDiscount} />
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
        <TotalRow
          label={order.shippingTitle || 'Shipping'}
          money={order.totalShipping}
        />
        {order.totalTax ? <TotalRow label="Tax" money={order.totalTax} /> : null}
        {hasPositiveMoney(order.totalRefunded) ? (
          <TotalRow
            label="Refunded"
            customValue={
              <span>
                -<Money data={order.totalRefunded} />
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
  const transactions = order.transactions.slice(0, 3);

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
                  <Money data={transaction.transactionAmount.presentmentMoney} />
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
            const tracking = fulfillment.trackingInformation[0];

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

                {fulfillment.fulfillmentLineItems.nodes.length ? (
                  <div className="mt-5 border-t border-border pt-4">
                    {fulfillment.fulfillmentLineItems.nodes.map((item) => (
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
