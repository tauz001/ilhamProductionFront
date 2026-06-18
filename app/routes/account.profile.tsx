import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {CheckoutFeedbackModal} from '~/components/account/CheckoutFeedbackModal';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const [searchParams] = useSearchParams();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const showFeedbackModal =
    searchParams.get('order_feedback') === '1' ||
    searchParams.get('feedback') === 'checkout';

  return (
    <div>
      <CheckoutFeedbackModal open={showFeedbackModal} />
      <div className="mb-8">
        <p className="small-caps text-ink/45">Profile</p>
        <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Personal details
        </h2>
      </div>

      <Form method="PUT" className="max-w-3xl border border-border bg-cream/35 p-6">
        <fieldset className="grid gap-5 border-0 p-0 md:grid-cols-2">
          <legend className="sr-only">Personal information</legend>
          <label htmlFor="firstName" className="grid gap-2">
            <span className="small-caps text-ink/50">First name</span>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
            />
          </label>
          <label htmlFor="lastName" className="grid gap-2">
            <span className="small-caps text-ink/50">Last name</span>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
            />
          </label>
        </fieldset>

        {action?.error ? (
          <p className="mt-5 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {action.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state !== 'idle'}
          className="mt-8 bg-ink px-8 py-4 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/40"
        >
          {state !== 'idle' ? 'Updating' : 'Update profile'}
        </button>
      </Form>
    </div>
  );
}
