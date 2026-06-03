import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {LogOut, MapPin, Package, UserRound} from 'lucide-react';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const firstName = customer?.firstName?.trim();
  const fullName = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');
  const addressCount = customer?.addresses?.nodes?.length ?? 0;
  const defaultCity = customer?.defaultAddress?.city;

  return (
    <div className="relative min-h-screen overflow-hidden bg-ivory pt-28 pb-24 lg:pt-36">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 top-24 font-display text-[24vw] leading-none text-gold/[0.05]"
      >
        ilham
      </span>

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
        <section className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="small-caps text-ink/50">Customer atelier</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.98] text-ink md:text-7xl">
              {firstName ? `Welcome, ${firstName}` : 'Welcome back'}
            </h1>
            <p className="mt-5 max-w-xl font-serif text-2xl italic leading-snug text-ink/65">
              Your orders, addresses, and profile live here, quietly kept by
              Shopify Customer Accounts.
            </p>
          </div>

          <div className="grid gap-3 border-l-0 border-border text-sm text-ink/65 lg:border-l lg:pl-10">
            <AccountMeta label="Member" value={fullName || 'Atelier guest'} />
            <AccountMeta
              label="Saved addresses"
              value={`${addressCount} ${addressCount === 1 ? 'address' : 'addresses'}`}
            />
            <AccountMeta label="Default city" value={defaultCity || 'Not set'} />
          </div>
        </section>

        <AccountMenu />

        <section className="mt-10">
          <Outlet context={{customer}} />
        </section>
      </div>
    </div>
  );
}

function AccountMeta({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/70 py-3 last:border-b-0">
      <span className="small-caps text-ink/45">{label}</span>
      <span className="font-serif text-xl text-ink">{value}</span>
    </div>
  );
}

function AccountMenu() {
  const itemClass = ({isActive}: {isActive: boolean; isPending: boolean}) =>
    [
      'inline-flex h-11 items-center gap-2 border px-4 small-caps text-[11px] transition-colors',
      isActive
        ? 'border-ink bg-ink text-ivory'
        : 'border-border bg-cream/40 text-ink/65 hover:border-ink hover:text-ink',
    ].join(' ');

  return (
    <nav
      role="navigation"
      aria-label="Account navigation"
      className="mt-8 flex flex-wrap items-center gap-3"
    >
      <NavLink to="/account/orders" className={itemClass}>
        <Package className="h-4 w-4" strokeWidth={1.4} />
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={itemClass}>
        <UserRound className="h-4 w-4" strokeWidth={1.4} />
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={itemClass}>
        <MapPin className="h-4 w-4" strokeWidth={1.4} />
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className="inline-flex h-11 items-center gap-2 border border-border px-4 small-caps text-[11px] text-ink/65 transition-colors hover:border-gold hover:text-gold"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.4} />
        Sign out
      </button>
    </Form>
  );
}
