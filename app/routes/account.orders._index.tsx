import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {encodeOrderRouteId} from '~/lib/customer-account/order-route-id';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="space-y-8">
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="space-y-4" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="border border-dashed border-border bg-cream/40 px-6 py-12 text-center">
      {hasFilters ? (
        <>
          <p className="font-serif text-2xl italic text-ink/70">
            No orders found matching your search.
          </p>
          <p className="mt-5">
            <Link to="/account/orders" className="small-caps story-link text-gold">
              Clear filters
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="small-caps text-ink/45">No orders yet</p>
          <p className="mt-3 font-serif text-3xl italic text-ink/70">
            Your first ilham piece will appear here.
          </p>
          <p className="mt-6">
            <Link to="/collections" className="small-caps story-link text-gold">
              Start shopping
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="border border-border bg-cream/35 p-5"
      aria-label="Search orders"
    >
      <fieldset className="grid gap-4 border-0 p-0 lg:grid-cols-[1fr_auto] lg:items-end">
        <legend className="small-caps text-ink/50">Filter orders</legend>

        <div className="grid gap-3 md:grid-cols-2 lg:col-start-1 lg:row-start-2">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
          />
        </div>

        <div className="flex gap-3 lg:col-start-2 lg:row-start-2">
          <button
            type="submit"
            disabled={isSearching}
            className="h-12 bg-ink px-6 small-caps text-[11px] text-ivory transition-colors hover:bg-gold disabled:bg-ink/40"
          >
            {isSearching ? 'Searching' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
              className="h-12 border border-border px-6 small-caps text-[11px] text-ink/65 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderHref = `/account/orders/${encodeOrderRouteId(order.id)}`;

  return (
    <article className="grid gap-5 border border-border bg-ivory/75 p-5 transition-colors hover:border-gold/70 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <Link
          to={orderHref}
          className="font-serif text-3xl text-ink transition-colors hover:text-gold"
        >
          #{order.number}
        </Link>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
          <span>{new Date(order.processedAt).toDateString()}</span>
          {order.confirmationNumber && (
            <span>Confirmation {order.confirmationNumber}</span>
          )}
          <span>{order.financialStatus}</span>
          {fulfillmentStatus && <span>{fulfillmentStatus}</span>}
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <span className="font-display text-3xl text-ink">
          <Money data={order.totalPrice} />
        </span>
        <Link
          to={orderHref}
          className="small-caps story-link text-gold"
        >
          View order
        </Link>
      </div>
    </article>
  );
}
