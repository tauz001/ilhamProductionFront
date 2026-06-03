import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div>
      <div className="mb-8">
        <p className="small-caps text-ink/45">Addresses</p>
        <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Where your pieces arrive
        </h2>
      </div>

      <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="small-caps text-ink/50">Create address</p>
          <NewAddressForm key={addresses.nodes.length} />
        </section>

        <section>
          {!addresses.nodes.length ? (
            <div className="border border-dashed border-border bg-cream/40 px-6 py-12 text-center">
              <p className="font-serif text-2xl italic text-ink/70">
                You have no addresses saved.
              </p>
            </div>
          ) : (
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="pt-2">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className="bg-ink px-8 py-4 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/40"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating' : 'Create address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div>
      <p className="small-caps text-ink/50">Existing addresses</p>
      <div className="mt-4 grid gap-6">
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
                className="bg-ink px-7 py-3 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/40"
              >
                {stateForMethod('PUT') !== 'idle' ? 'Saving' : 'Save'}
              </button>
              <button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                className="border border-border px-7 py-3 small-caps text-ink/65 transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
              >
                {stateForMethod('DELETE') !== 'idle' ? 'Deleting' : 'Delete'}
              </button>
            </div>
          )}
        </AddressForm>
      ))}
      </div>
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  const idSuffix = String(addressId).replace(/[^a-zA-Z0-9_-]/g, '-');
  const fieldId = (field: string) => `${field}-${idSuffix}`;

  return (
    <Form id={`address-form-${idSuffix}`} className="mt-4 border border-border bg-cream/35 p-5">
      <fieldset className="grid gap-4 border-0 p-0 md:grid-cols-2">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <AddressInput
          autoComplete="given-name"
          defaultValue={address?.firstName ?? ''}
          id={fieldId('firstName')}
          label="First name*"
          name="firstName"
          placeholder="First name"
          required
        />
        <AddressInput
          autoComplete="family-name"
          defaultValue={address?.lastName ?? ''}
          id={fieldId('lastName')}
          label="Last name*"
          name="lastName"
          placeholder="Last name"
          required
        />
        <AddressInput
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id={fieldId('company')}
          label="Company"
          name="company"
          placeholder="Company"
        />
        <AddressInput
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id={fieldId('address1')}
          label="Address line*"
          name="address1"
          placeholder="Address line 1"
          required
        />
        <AddressInput
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id={fieldId('address2')}
          label="Address line 2"
          name="address2"
          placeholder="Address line 2"
        />
        <AddressInput
          autoComplete="address-level2"
          defaultValue={address?.city ?? ''}
          id={fieldId('city')}
          label="City*"
          name="city"
          placeholder="City"
          required
        />
        <AddressInput
          autoComplete="address-level1"
          defaultValue={address?.zoneCode ?? ''}
          id={fieldId('zoneCode')}
          label="State / Province*"
          name="zoneCode"
          placeholder="State / Province"
          required
        />
        <AddressInput
          autoComplete="postal-code"
          defaultValue={address?.zip ?? ''}
          id={fieldId('zip')}
          label="Zip / Postal Code*"
          name="zip"
          placeholder="Zip / Postal Code"
          required
        />
        <AddressInput
          autoComplete="country"
          defaultValue={address?.territoryCode ?? ''}
          id={fieldId('territoryCode')}
          label="Country code*"
          maxLength={2}
          name="territoryCode"
          placeholder="IN"
          required
        />
        <AddressInput
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id={fieldId('phoneNumber')}
          label="Phone"
          name="phoneNumber"
          pattern="^\\+?[1-9]\\d{3,14}$"
          placeholder="+919999999999"
          type="tel"
        />
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            className="h-4 w-4 accent-ink"
            defaultChecked={isDefaultAddress}
            id={fieldId('defaultAddress')}
            name="defaultAddress"
            type="checkbox"
          />
          <label htmlFor={fieldId('defaultAddress')} className="text-sm text-ink/65">
            Set as default address
          </label>
        </div>
        {error ? (
          <p className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:col-span-2">
            {error}
          </p>
        ) : null}
        <div className="md:col-span-2">
          {children({
            stateForMethod: (method) => (formMethod === method ? state : 'idle'),
          })}
        </div>
      </fieldset>
    </Form>
  );
}

function AddressInput({
  id,
  label,
  name,
  type = 'text',
  ...props
}: {
  autoComplete?: string;
  defaultValue?: string;
  id: string;
  label: string;
  maxLength?: number;
  name: string;
  pattern?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label htmlFor={id} className="grid gap-2">
      <span className="small-caps text-ink/50">{label}</span>
      <input
        {...props}
        aria-label={label.replace('*', '')}
        id={id}
        name={name}
        type={type}
        className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
      />
    </label>
  );
}
