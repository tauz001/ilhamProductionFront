/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerAccountAPI from '@shopify/hydrogen/customer-account-api-types';

export type CustomerAddressUpdateMutationVariables = CustomerAccountAPI.Exact<{
  address: CustomerAccountAPI.CustomerAddressInput;
  addressId: CustomerAccountAPI.Scalars['ID']['input'];
  defaultAddress?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Boolean']['input']
  >;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerAddressUpdateMutation = {
  customerAddressUpdate?: CustomerAccountAPI.Maybe<{
    customerAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerAddress, 'id'>
    >;
    userErrors: Array<
      Pick<
        CustomerAccountAPI.UserErrorsCustomerAddressUserErrors,
        'code' | 'field' | 'message'
      >
    >;
  }>;
};

export type CustomerAddressDeleteMutationVariables = CustomerAccountAPI.Exact<{
  addressId: CustomerAccountAPI.Scalars['ID']['input'];
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerAddressDeleteMutation = {
  customerAddressDelete?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.CustomerAddressDeletePayload,
      'deletedAddressId'
    > & {
      userErrors: Array<
        Pick<
          CustomerAccountAPI.UserErrorsCustomerAddressUserErrors,
          'code' | 'field' | 'message'
        >
      >;
    }
  >;
};

export type CustomerAddressCreateMutationVariables = CustomerAccountAPI.Exact<{
  address: CustomerAccountAPI.CustomerAddressInput;
  defaultAddress?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Boolean']['input']
  >;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerAddressCreateMutation = {
  customerAddressCreate?: CustomerAccountAPI.Maybe<{
    customerAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerAddress, 'id'>
    >;
    userErrors: Array<
      Pick<
        CustomerAccountAPI.UserErrorsCustomerAddressUserErrors,
        'code' | 'field' | 'message'
      >
    >;
  }>;
};

export type CustomerFragment = Pick<
  CustomerAccountAPI.Customer,
  'id' | 'firstName' | 'lastName'
> & {
  defaultAddress?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.CustomerAddress,
      | 'id'
      | 'formatted'
      | 'firstName'
      | 'lastName'
      | 'company'
      | 'address1'
      | 'address2'
      | 'territoryCode'
      | 'zoneCode'
      | 'city'
      | 'zip'
      | 'phoneNumber'
    >
  >;
  addresses: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.CustomerAddress,
        | 'id'
        | 'formatted'
        | 'firstName'
        | 'lastName'
        | 'company'
        | 'address1'
        | 'address2'
        | 'territoryCode'
        | 'zoneCode'
        | 'city'
        | 'zip'
        | 'phoneNumber'
      >
    >;
  };
};

export type AddressFragment = Pick<
  CustomerAccountAPI.CustomerAddress,
  | 'id'
  | 'formatted'
  | 'firstName'
  | 'lastName'
  | 'company'
  | 'address1'
  | 'address2'
  | 'territoryCode'
  | 'zoneCode'
  | 'city'
  | 'zip'
  | 'phoneNumber'
>;

export type CustomerDetailsQueryVariables = CustomerAccountAPI.Exact<{
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerDetailsQuery = {
  customer: Pick<
    CustomerAccountAPI.Customer,
    'id' | 'firstName' | 'lastName'
  > & {
    defaultAddress?: CustomerAccountAPI.Maybe<
      Pick<
        CustomerAccountAPI.CustomerAddress,
        | 'id'
        | 'formatted'
        | 'firstName'
        | 'lastName'
        | 'company'
        | 'address1'
        | 'address2'
        | 'territoryCode'
        | 'zoneCode'
        | 'city'
        | 'zip'
        | 'phoneNumber'
      >
    >;
    addresses: {
      nodes: Array<
        Pick<
          CustomerAccountAPI.CustomerAddress,
          | 'id'
          | 'formatted'
          | 'firstName'
          | 'lastName'
          | 'company'
          | 'address1'
          | 'address2'
          | 'territoryCode'
          | 'zoneCode'
          | 'city'
          | 'zip'
          | 'phoneNumber'
        >
      >;
    };
  };
};

export type CustomerOrderFeedbackOwnershipQueryVariables =
  CustomerAccountAPI.Exact<{
    first: CustomerAccountAPI.Scalars['Int']['input'];
    query?: CustomerAccountAPI.InputMaybe<
      CustomerAccountAPI.Scalars['String']['input']
    >;
    language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
  }>;

export type CustomerOrderFeedbackOwnershipQuery = {
  customer: Pick<CustomerAccountAPI.Customer, 'id'> & {
    orders: {nodes: Array<Pick<CustomerAccountAPI.Order, 'id'>>};
  };
};

export type OrderMoneyFragment = Pick<
  CustomerAccountAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type DiscountApplicationFragment = {
  value:
    | ({__typename: 'MoneyV2'} & Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >)
    | ({__typename: 'PricingPercentageValue'} & Pick<
        CustomerAccountAPI.PricingPercentageValue,
        'percentage'
      >);
};

export type OrderLineItemFullFragment = Pick<
  CustomerAccountAPI.LineItem,
  'id' | 'title' | 'quantity' | 'sku' | 'requiresShipping' | 'variantTitle'
> & {
  price?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  currentTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  soldTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  discountAllocations: Array<{
    allocatedAmount: Pick<
      CustomerAccountAPI.MoneyV2,
      'amount' | 'currencyCode'
    >;
    discountApplication: {
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            CustomerAccountAPI.PricingPercentageValue,
            'percentage'
          >);
    };
  }>;
  totalDiscount: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  image?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Image,
      'altText' | 'height' | 'url' | 'id' | 'width'
    >
  >;
};

export type OrderFragment = Pick<
  CustomerAccountAPI.Order,
  | 'id'
  | 'name'
  | 'confirmationNumber'
  | 'statusPageUrl'
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'processedAt'
  | 'updatedAt'
  | 'requiresShipping'
  | 'shippingTitle'
> & {
  fulfillments: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.Fulfillment,
        | 'id'
        | 'status'
        | 'latestShipmentStatus'
        | 'createdAt'
        | 'updatedAt'
        | 'estimatedDeliveryAt'
        | 'requiresShipping'
      > & {
        trackingInformation: Array<
          Pick<
            CustomerAccountAPI.TrackingInformation,
            'company' | 'number' | 'url'
          >
        >;
        events: {
          nodes: Array<
            Pick<
              CustomerAccountAPI.FulfillmentEvent,
              'id' | 'status' | 'happenedAt'
            >
          >;
        };
        fulfillmentLineItems: {
          nodes: Array<
            Pick<CustomerAccountAPI.FulfillmentLineItem, 'id' | 'quantity'> & {
              lineItem: Pick<
                CustomerAccountAPI.LineItem,
                'id' | 'title' | 'variantTitle'
              > & {
                image?: CustomerAccountAPI.Maybe<
                  Pick<
                    CustomerAccountAPI.Image,
                    'altText' | 'height' | 'url' | 'id' | 'width'
                  >
                >;
              };
            }
          >;
        };
      }
    >;
  };
  totalTax?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  totalShipping: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  totalRefunded: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  subtotal?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  shippingAddress?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.CustomerAddress,
      'name' | 'formatted' | 'formattedArea'
    >
  >;
  discountApplications: {
    nodes: Array<{
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            CustomerAccountAPI.PricingPercentageValue,
            'percentage'
          >);
    }>;
  };
  transactions: Array<
    Pick<
      CustomerAccountAPI.OrderTransaction,
      'id' | 'kind' | 'status' | 'type' | 'processedAt'
    > & {
      transactionAmount: {
        presentmentMoney: Pick<
          CustomerAccountAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
      };
    }
  >;
  lineItems: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.LineItem,
        | 'id'
        | 'title'
        | 'quantity'
        | 'sku'
        | 'requiresShipping'
        | 'variantTitle'
      > & {
        price?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        currentTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        soldTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        discountAllocations: Array<{
          allocatedAmount: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          discountApplication: {
            value:
              | ({__typename: 'MoneyV2'} & Pick<
                  CustomerAccountAPI.MoneyV2,
                  'amount' | 'currencyCode'
                >)
              | ({__typename: 'PricingPercentageValue'} & Pick<
                  CustomerAccountAPI.PricingPercentageValue,
                  'percentage'
                >);
          };
        }>;
        totalDiscount: Pick<
          CustomerAccountAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
        image?: CustomerAccountAPI.Maybe<
          Pick<
            CustomerAccountAPI.Image,
            'altText' | 'height' | 'url' | 'id' | 'width'
          >
        >;
      }
    >;
  };
};

export type OrderQueryVariables = CustomerAccountAPI.Exact<{
  orderId: CustomerAccountAPI.Scalars['ID']['input'];
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type OrderQuery = {
  order?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Order,
      | 'id'
      | 'name'
      | 'confirmationNumber'
      | 'statusPageUrl'
      | 'financialStatus'
      | 'fulfillmentStatus'
      | 'processedAt'
      | 'updatedAt'
      | 'requiresShipping'
      | 'shippingTitle'
    > & {
      fulfillments: {
        nodes: Array<
          Pick<
            CustomerAccountAPI.Fulfillment,
            | 'id'
            | 'status'
            | 'latestShipmentStatus'
            | 'createdAt'
            | 'updatedAt'
            | 'estimatedDeliveryAt'
            | 'requiresShipping'
          > & {
            trackingInformation: Array<
              Pick<
                CustomerAccountAPI.TrackingInformation,
                'company' | 'number' | 'url'
              >
            >;
            events: {
              nodes: Array<
                Pick<
                  CustomerAccountAPI.FulfillmentEvent,
                  'id' | 'status' | 'happenedAt'
                >
              >;
            };
            fulfillmentLineItems: {
              nodes: Array<
                Pick<
                  CustomerAccountAPI.FulfillmentLineItem,
                  'id' | 'quantity'
                > & {
                  lineItem: Pick<
                    CustomerAccountAPI.LineItem,
                    'id' | 'title' | 'variantTitle'
                  > & {
                    image?: CustomerAccountAPI.Maybe<
                      Pick<
                        CustomerAccountAPI.Image,
                        'altText' | 'height' | 'url' | 'id' | 'width'
                      >
                    >;
                  };
                }
              >;
            };
          }
        >;
      };
      totalTax?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      totalShipping: Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >;
      totalRefunded: Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >;
      totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
      subtotal?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      shippingAddress?: CustomerAccountAPI.Maybe<
        Pick<
          CustomerAccountAPI.CustomerAddress,
          'name' | 'formatted' | 'formattedArea'
        >
      >;
      discountApplications: {
        nodes: Array<{
          value:
            | ({__typename: 'MoneyV2'} & Pick<
                CustomerAccountAPI.MoneyV2,
                'amount' | 'currencyCode'
              >)
            | ({__typename: 'PricingPercentageValue'} & Pick<
                CustomerAccountAPI.PricingPercentageValue,
                'percentage'
              >);
        }>;
      };
      transactions: Array<
        Pick<
          CustomerAccountAPI.OrderTransaction,
          'id' | 'kind' | 'status' | 'type' | 'processedAt'
        > & {
          transactionAmount: {
            presentmentMoney: Pick<
              CustomerAccountAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
        }
      >;
      lineItems: {
        nodes: Array<
          Pick<
            CustomerAccountAPI.LineItem,
            | 'id'
            | 'title'
            | 'quantity'
            | 'sku'
            | 'requiresShipping'
            | 'variantTitle'
          > & {
            price?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            currentTotalPrice?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            soldTotalPrice?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            discountAllocations: Array<{
              allocatedAmount: Pick<
                CustomerAccountAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              discountApplication: {
                value:
                  | ({__typename: 'MoneyV2'} & Pick<
                      CustomerAccountAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >)
                  | ({__typename: 'PricingPercentageValue'} & Pick<
                      CustomerAccountAPI.PricingPercentageValue,
                      'percentage'
                    >);
              };
            }>;
            totalDiscount: Pick<
              CustomerAccountAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            image?: CustomerAccountAPI.Maybe<
              Pick<
                CustomerAccountAPI.Image,
                'altText' | 'height' | 'url' | 'id' | 'width'
              >
            >;
          }
        >;
      };
    }
  >;
};

export type SafeOrderMoneyFragment = Pick<
  CustomerAccountAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type SafeDiscountApplicationFragment = {
  value:
    | ({__typename: 'MoneyV2'} & Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >)
    | ({__typename: 'PricingPercentageValue'} & Pick<
        CustomerAccountAPI.PricingPercentageValue,
        'percentage'
      >);
};

export type SafeOrderLineItemFullFragment = Pick<
  CustomerAccountAPI.LineItem,
  'id' | 'title' | 'quantity' | 'sku' | 'requiresShipping' | 'variantTitle'
> & {
  price?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  currentTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  soldTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  totalDiscount: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  image?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Image,
      'altText' | 'height' | 'url' | 'id' | 'width'
    >
  >;
};

export type SafeOrderFragment = Pick<
  CustomerAccountAPI.Order,
  | 'id'
  | 'name'
  | 'number'
  | 'confirmationNumber'
  | 'statusPageUrl'
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'processedAt'
  | 'requiresShipping'
> & {
  fulfillments: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.Fulfillment,
        'id' | 'status' | 'createdAt' | 'estimatedDeliveryAt'
      > & {
        trackingInformation: Array<
          Pick<
            CustomerAccountAPI.TrackingInformation,
            'company' | 'number' | 'url'
          >
        >;
      }
    >;
  };
  totalTax?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  subtotal?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  shippingAddress?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.CustomerAddress,
      'name' | 'formatted' | 'formattedArea'
    >
  >;
  discountApplications: {
    nodes: Array<{
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            CustomerAccountAPI.PricingPercentageValue,
            'percentage'
          >);
    }>;
  };
  lineItems: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.LineItem,
        | 'id'
        | 'title'
        | 'quantity'
        | 'sku'
        | 'requiresShipping'
        | 'variantTitle'
      > & {
        price?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        currentTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        soldTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        totalDiscount: Pick<
          CustomerAccountAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
        image?: CustomerAccountAPI.Maybe<
          Pick<
            CustomerAccountAPI.Image,
            'altText' | 'height' | 'url' | 'id' | 'width'
          >
        >;
      }
    >;
  };
};

export type SafeOrderQueryVariables = CustomerAccountAPI.Exact<{
  orderId: CustomerAccountAPI.Scalars['ID']['input'];
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type SafeOrderQuery = {
  order?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Order,
      | 'id'
      | 'name'
      | 'number'
      | 'confirmationNumber'
      | 'statusPageUrl'
      | 'financialStatus'
      | 'fulfillmentStatus'
      | 'processedAt'
      | 'requiresShipping'
    > & {
      fulfillments: {
        nodes: Array<
          Pick<
            CustomerAccountAPI.Fulfillment,
            'id' | 'status' | 'createdAt' | 'estimatedDeliveryAt'
          > & {
            trackingInformation: Array<
              Pick<
                CustomerAccountAPI.TrackingInformation,
                'company' | 'number' | 'url'
              >
            >;
          }
        >;
      };
      totalTax?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
      subtotal?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      shippingAddress?: CustomerAccountAPI.Maybe<
        Pick<
          CustomerAccountAPI.CustomerAddress,
          'name' | 'formatted' | 'formattedArea'
        >
      >;
      discountApplications: {
        nodes: Array<{
          value:
            | ({__typename: 'MoneyV2'} & Pick<
                CustomerAccountAPI.MoneyV2,
                'amount' | 'currencyCode'
              >)
            | ({__typename: 'PricingPercentageValue'} & Pick<
                CustomerAccountAPI.PricingPercentageValue,
                'percentage'
              >);
        }>;
      };
      lineItems: {
        nodes: Array<
          Pick<
            CustomerAccountAPI.LineItem,
            | 'id'
            | 'title'
            | 'quantity'
            | 'sku'
            | 'requiresShipping'
            | 'variantTitle'
          > & {
            price?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            currentTotalPrice?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            soldTotalPrice?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            totalDiscount: Pick<
              CustomerAccountAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            image?: CustomerAccountAPI.Maybe<
              Pick<
                CustomerAccountAPI.Image,
                'altText' | 'height' | 'url' | 'id' | 'width'
              >
            >;
          }
        >;
      };
    }
  >;
};

export type CustomerOwnedOrderMoneyFragment = Pick<
  CustomerAccountAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type CustomerOwnedDiscountApplicationFragment = {
  value:
    | ({__typename: 'MoneyV2'} & Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >)
    | ({__typename: 'PricingPercentageValue'} & Pick<
        CustomerAccountAPI.PricingPercentageValue,
        'percentage'
      >);
};

export type CustomerOwnedOrderLineItemFragment = Pick<
  CustomerAccountAPI.LineItem,
  'id' | 'title' | 'quantity' | 'sku' | 'requiresShipping' | 'variantTitle'
> & {
  price?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  currentTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  soldTotalPrice?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  totalDiscount: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  image?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Image,
      'altText' | 'height' | 'url' | 'id' | 'width'
    >
  >;
};

export type CustomerOwnedOrderFragment = Pick<
  CustomerAccountAPI.Order,
  | 'id'
  | 'name'
  | 'number'
  | 'confirmationNumber'
  | 'statusPageUrl'
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'processedAt'
  | 'updatedAt'
  | 'requiresShipping'
  | 'shippingTitle'
> & {
  fulfillments: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.Fulfillment,
        'id' | 'status' | 'createdAt' | 'updatedAt' | 'estimatedDeliveryAt'
      > & {
        trackingInformation: Array<
          Pick<
            CustomerAccountAPI.TrackingInformation,
            'company' | 'number' | 'url'
          >
        >;
      }
    >;
  };
  totalTax?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  totalShipping: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  totalRefunded: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  subtotal?: CustomerAccountAPI.Maybe<
    Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  shippingAddress?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.CustomerAddress,
      'name' | 'formatted' | 'formattedArea'
    >
  >;
  discountApplications: {
    nodes: Array<{
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            CustomerAccountAPI.PricingPercentageValue,
            'percentage'
          >);
    }>;
  };
  lineItems: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.LineItem,
        | 'id'
        | 'title'
        | 'quantity'
        | 'sku'
        | 'requiresShipping'
        | 'variantTitle'
      > & {
        price?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        currentTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        soldTotalPrice?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        totalDiscount: Pick<
          CustomerAccountAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
        image?: CustomerAccountAPI.Maybe<
          Pick<
            CustomerAccountAPI.Image,
            'altText' | 'height' | 'url' | 'id' | 'width'
          >
        >;
      }
    >;
  };
};

export type CustomerOrderFromCustomerQueryVariables = CustomerAccountAPI.Exact<{
  first?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Int']['input']
  >;
  query?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['String']['input']
  >;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerOrderFromCustomerQuery = {
  customer: {
    orders: {
      nodes: Array<
        Pick<
          CustomerAccountAPI.Order,
          | 'id'
          | 'name'
          | 'number'
          | 'confirmationNumber'
          | 'statusPageUrl'
          | 'financialStatus'
          | 'fulfillmentStatus'
          | 'processedAt'
          | 'updatedAt'
          | 'requiresShipping'
          | 'shippingTitle'
        > & {
          fulfillments: {
            nodes: Array<
              Pick<
                CustomerAccountAPI.Fulfillment,
                | 'id'
                | 'status'
                | 'createdAt'
                | 'updatedAt'
                | 'estimatedDeliveryAt'
              > & {
                trackingInformation: Array<
                  Pick<
                    CustomerAccountAPI.TrackingInformation,
                    'company' | 'number' | 'url'
                  >
                >;
              }
            >;
          };
          totalTax?: CustomerAccountAPI.Maybe<
            Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          totalShipping: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          totalRefunded: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          totalPrice: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          subtotal?: CustomerAccountAPI.Maybe<
            Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          shippingAddress?: CustomerAccountAPI.Maybe<
            Pick<
              CustomerAccountAPI.CustomerAddress,
              'name' | 'formatted' | 'formattedArea'
            >
          >;
          discountApplications: {
            nodes: Array<{
              value:
                | ({__typename: 'MoneyV2'} & Pick<
                    CustomerAccountAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >)
                | ({__typename: 'PricingPercentageValue'} & Pick<
                    CustomerAccountAPI.PricingPercentageValue,
                    'percentage'
                  >);
            }>;
          };
          lineItems: {
            nodes: Array<
              Pick<
                CustomerAccountAPI.LineItem,
                | 'id'
                | 'title'
                | 'quantity'
                | 'sku'
                | 'requiresShipping'
                | 'variantTitle'
              > & {
                price?: CustomerAccountAPI.Maybe<
                  Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                currentTotalPrice?: CustomerAccountAPI.Maybe<
                  Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                soldTotalPrice?: CustomerAccountAPI.Maybe<
                  Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                totalDiscount: Pick<
                  CustomerAccountAPI.MoneyV2,
                  'amount' | 'currencyCode'
                >;
                image?: CustomerAccountAPI.Maybe<
                  Pick<
                    CustomerAccountAPI.Image,
                    'altText' | 'height' | 'url' | 'id' | 'width'
                  >
                >;
              }
            >;
          };
        }
      >;
    };
  };
};

export type CustomerOrderOwnershipMoneyFragment = Pick<
  CustomerAccountAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type CustomerOrderOwnershipFragment = Pick<
  CustomerAccountAPI.Order,
  | 'id'
  | 'name'
  | 'number'
  | 'confirmationNumber'
  | 'statusPageUrl'
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'processedAt'
  | 'updatedAt'
> & {
  totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  fulfillments: {
    nodes: Array<Pick<CustomerAccountAPI.Fulfillment, 'id' | 'status'>>;
  };
};

export type CustomerOrderOwnershipQueryVariables = CustomerAccountAPI.Exact<{
  first?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Int']['input']
  >;
  query?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['String']['input']
  >;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerOrderOwnershipQuery = {
  customer: {
    emailAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerEmailAddress, 'emailAddress'>
    >;
    orders: {
      nodes: Array<
        Pick<
          CustomerAccountAPI.Order,
          | 'id'
          | 'name'
          | 'number'
          | 'confirmationNumber'
          | 'statusPageUrl'
          | 'financialStatus'
          | 'fulfillmentStatus'
          | 'processedAt'
          | 'updatedAt'
        > & {
          totalPrice: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          fulfillments: {
            nodes: Array<Pick<CustomerAccountAPI.Fulfillment, 'id' | 'status'>>;
          };
        }
      >;
    };
  };
};

export type OrderItemFragment = Pick<
  CustomerAccountAPI.Order,
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'id'
  | 'number'
  | 'confirmationNumber'
  | 'processedAt'
> & {
  totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
  fulfillments: {nodes: Array<Pick<CustomerAccountAPI.Fulfillment, 'status'>>};
};

export type CustomerOrdersFragment = {
  orders: {
    nodes: Array<
      Pick<
        CustomerAccountAPI.Order,
        | 'financialStatus'
        | 'fulfillmentStatus'
        | 'id'
        | 'number'
        | 'confirmationNumber'
        | 'processedAt'
      > & {
        totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
        fulfillments: {
          nodes: Array<Pick<CustomerAccountAPI.Fulfillment, 'status'>>;
        };
      }
    >;
    pageInfo: Pick<
      CustomerAccountAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
    >;
  };
};

export type CustomerOrdersQueryVariables = CustomerAccountAPI.Exact<{
  endCursor?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['String']['input']
  >;
  first?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Int']['input']
  >;
  last?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['Int']['input']
  >;
  startCursor?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['String']['input']
  >;
  query?: CustomerAccountAPI.InputMaybe<
    CustomerAccountAPI.Scalars['String']['input']
  >;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerOrdersQuery = {
  customer: {
    orders: {
      nodes: Array<
        Pick<
          CustomerAccountAPI.Order,
          | 'financialStatus'
          | 'fulfillmentStatus'
          | 'id'
          | 'number'
          | 'confirmationNumber'
          | 'processedAt'
        > & {
          totalPrice: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          fulfillments: {
            nodes: Array<Pick<CustomerAccountAPI.Fulfillment, 'status'>>;
          };
        }
      >;
      pageInfo: Pick<
        CustomerAccountAPI.PageInfo,
        'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
      >;
    };
  };
};

export type CustomerUpdateMutationVariables = CustomerAccountAPI.Exact<{
  customer: CustomerAccountAPI.CustomerUpdateInput;
  language?: CustomerAccountAPI.InputMaybe<CustomerAccountAPI.LanguageCode>;
}>;

export type CustomerUpdateMutation = {
  customerUpdate?: CustomerAccountAPI.Maybe<{
    customer?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.Customer, 'firstName' | 'lastName'> & {
        emailAddress?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.CustomerEmailAddress, 'emailAddress'>
        >;
        phoneNumber?: CustomerAccountAPI.Maybe<
          Pick<CustomerAccountAPI.CustomerPhoneNumber, 'phoneNumber'>
        >;
      }
    >;
    userErrors: Array<
      Pick<
        CustomerAccountAPI.UserErrorsCustomerUserErrors,
        'code' | 'field' | 'message'
      >
    >;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  query CustomerDetails($language: LanguageCode) @inContext(language: $language) {\n    customer {\n      ...Customer\n    }\n  }\n  #graphql\n  fragment Customer on Customer {\n    id\n    firstName\n    lastName\n    defaultAddress {\n      ...Address\n    }\n    addresses(first: 6) {\n      nodes {\n        ...Address\n      }\n    }\n  }\n  fragment Address on CustomerAddress {\n    id\n    formatted\n    firstName\n    lastName\n    company\n    address1\n    address2\n    territoryCode\n    zoneCode\n    city\n    zip\n    phoneNumber\n  }\n\n': {
    return: CustomerDetailsQuery;
    variables: CustomerDetailsQueryVariables;
  };
  '#graphql\n  query CustomerOrderFeedbackOwnership(\n    $first: Int!\n    $query: String\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customer {\n      id\n      orders(\n        first: $first\n        sortKey: PROCESSED_AT\n        reverse: true\n        query: $query\n      ) {\n        nodes {\n          id\n        }\n      }\n    }\n  }\n': {
    return: CustomerOrderFeedbackOwnershipQuery;
    variables: CustomerOrderFeedbackOwnershipQueryVariables;
  };
  '#graphql\n  fragment OrderMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment DiscountApplication on DiscountApplication {\n    value {\n      __typename\n      ... on MoneyV2 {\n        ...OrderMoney\n      }\n      ... on PricingPercentageValue {\n        percentage\n      }\n    }\n  }\n  fragment OrderLineItemFull on LineItem {\n    id\n    title\n    quantity\n    sku\n    requiresShipping\n    price {\n      ...OrderMoney\n    }\n    currentTotalPrice {\n      ...OrderMoney\n    }\n    soldTotalPrice {\n      ...OrderMoney\n    }\n    discountAllocations {\n      allocatedAmount {\n        ...OrderMoney\n      }\n      discountApplication {\n        ...DiscountApplication\n      }\n    }\n    totalDiscount {\n      ...OrderMoney\n    }\n    image {\n      altText\n      height\n      url\n      id\n      width\n    }\n    variantTitle\n  }\n  fragment Order on Order {\n    id\n    name\n    confirmationNumber\n    statusPageUrl\n    financialStatus\n    fulfillmentStatus\n    processedAt\n    updatedAt\n    requiresShipping\n    shippingTitle\n    fulfillments(first: 10, sortKey: CREATED_AT) {\n      nodes {\n        id\n        status\n        latestShipmentStatus\n        createdAt\n        updatedAt\n        estimatedDeliveryAt\n        requiresShipping\n        trackingInformation {\n          company\n          number\n          url\n        }\n        events(first: 10, sortKey: HAPPENED_AT, reverse: true) {\n          nodes {\n            id\n            status\n            happenedAt\n          }\n        }\n        fulfillmentLineItems(first: 20) {\n          nodes {\n            id\n            quantity\n            lineItem {\n              id\n              title\n              variantTitle\n              image {\n                altText\n                height\n                url\n                id\n                width\n              }\n            }\n          }\n        }\n      }\n    }\n    totalTax {\n      ...OrderMoney\n    }\n    totalShipping {\n      ...OrderMoney\n    }\n    totalRefunded {\n      ...OrderMoney\n    }\n    totalPrice {\n      ...OrderMoney\n    }\n    subtotal {\n      ...OrderMoney\n    }\n    shippingAddress {\n      name\n      formatted(withName: true)\n      formattedArea\n    }\n    discountApplications(first: 100) {\n      nodes {\n        ...DiscountApplication\n      }\n    }\n    transactions {\n      id\n      kind\n      status\n      type\n      processedAt\n      transactionAmount {\n        presentmentMoney {\n          ...OrderMoney\n        }\n      }\n    }\n    lineItems(first: 100) {\n      nodes {\n        ...OrderLineItemFull\n      }\n    }\n  }\n  query Order($orderId: ID!, $language: LanguageCode)\n    @inContext(language: $language) {\n    order(id: $orderId) {\n      ... on Order {\n        ...Order\n      }\n    }\n  }\n': {
    return: OrderQuery;
    variables: OrderQueryVariables;
  };
  '#graphql\n  fragment SafeOrderMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment SafeDiscountApplication on DiscountApplication {\n    value {\n      __typename\n      ... on MoneyV2 {\n        ...SafeOrderMoney\n      }\n      ... on PricingPercentageValue {\n        percentage\n      }\n    }\n  }\n  fragment SafeOrderLineItemFull on LineItem {\n    id\n    title\n    quantity\n    sku\n    requiresShipping\n    price {\n      ...SafeOrderMoney\n    }\n    currentTotalPrice {\n      ...SafeOrderMoney\n    }\n    soldTotalPrice {\n      ...SafeOrderMoney\n    }\n    totalDiscount {\n      ...SafeOrderMoney\n    }\n    image {\n      altText\n      height\n      url\n      id\n      width\n    }\n    variantTitle\n  }\n  fragment SafeOrder on Order {\n    id\n    name\n    number\n    confirmationNumber\n    statusPageUrl\n    financialStatus\n    fulfillmentStatus\n    processedAt\n    requiresShipping\n    fulfillments(first: 5, sortKey: CREATED_AT) {\n      nodes {\n        id\n        status\n        createdAt\n        estimatedDeliveryAt\n        trackingInformation {\n          company\n          number\n          url\n        }\n      }\n    }\n    totalTax {\n      ...SafeOrderMoney\n    }\n    totalPrice {\n      ...SafeOrderMoney\n    }\n    subtotal {\n      ...SafeOrderMoney\n    }\n    shippingAddress {\n      name\n      formatted(withName: true)\n      formattedArea\n    }\n    discountApplications(first: 100) {\n      nodes {\n        ...SafeDiscountApplication\n      }\n    }\n    lineItems(first: 100) {\n      nodes {\n        ...SafeOrderLineItemFull\n      }\n    }\n  }\n  query SafeOrder($orderId: ID!, $language: LanguageCode)\n    @inContext(language: $language) {\n    order(id: $orderId) {\n      ... on Order {\n        ...SafeOrder\n      }\n    }\n  }\n': {
    return: SafeOrderQuery;
    variables: SafeOrderQueryVariables;
  };
  '#graphql\n  fragment CustomerOwnedOrderMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment CustomerOwnedDiscountApplication on DiscountApplication {\n    value {\n      __typename\n      ... on MoneyV2 {\n        ...CustomerOwnedOrderMoney\n      }\n      ... on PricingPercentageValue {\n        percentage\n      }\n    }\n  }\n  fragment CustomerOwnedOrderLineItem on LineItem {\n    id\n    title\n    quantity\n    sku\n    requiresShipping\n    price {\n      ...CustomerOwnedOrderMoney\n    }\n    currentTotalPrice {\n      ...CustomerOwnedOrderMoney\n    }\n    soldTotalPrice {\n      ...CustomerOwnedOrderMoney\n    }\n    totalDiscount {\n      ...CustomerOwnedOrderMoney\n    }\n    image {\n      altText\n      height\n      url\n      id\n      width\n    }\n    variantTitle\n  }\n  fragment CustomerOwnedOrder on Order {\n    id\n    name\n    number\n    confirmationNumber\n    statusPageUrl\n    financialStatus\n    fulfillmentStatus\n    processedAt\n    updatedAt\n    requiresShipping\n    shippingTitle\n    fulfillments(first: 5, sortKey: CREATED_AT) {\n      nodes {\n        id\n        status\n        createdAt\n        updatedAt\n        estimatedDeliveryAt\n        trackingInformation {\n          company\n          number\n          url\n        }\n      }\n    }\n    totalTax {\n      ...CustomerOwnedOrderMoney\n    }\n    totalShipping {\n      ...CustomerOwnedOrderMoney\n    }\n    totalRefunded {\n      ...CustomerOwnedOrderMoney\n    }\n    totalPrice {\n      ...CustomerOwnedOrderMoney\n    }\n    subtotal {\n      ...CustomerOwnedOrderMoney\n    }\n    shippingAddress {\n      name\n      formatted(withName: true)\n      formattedArea\n    }\n    discountApplications(first: 100) {\n      nodes {\n        ...CustomerOwnedDiscountApplication\n      }\n    }\n    lineItems(first: 100) {\n      nodes {\n        ...CustomerOwnedOrderLineItem\n      }\n    }\n  }\n  query CustomerOrderFromCustomer(\n    $first: Int\n    $query: String\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customer {\n      orders(\n        first: $first\n        sortKey: PROCESSED_AT\n        reverse: true\n        query: $query\n      ) {\n        nodes {\n          ...CustomerOwnedOrder\n        }\n      }\n    }\n  }\n': {
    return: CustomerOrderFromCustomerQuery;
    variables: CustomerOrderFromCustomerQueryVariables;
  };
  '#graphql\n  fragment CustomerOrderOwnershipMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment CustomerOrderOwnership on Order {\n    id\n    name\n    number\n    confirmationNumber\n    statusPageUrl\n    financialStatus\n    fulfillmentStatus\n    processedAt\n    updatedAt\n    totalPrice {\n      ...CustomerOrderOwnershipMoney\n    }\n    fulfillments(first: 1) {\n      nodes {\n        id\n        status\n      }\n    }\n  }\n  query CustomerOrderOwnership(\n    $first: Int\n    $query: String\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customer {\n      emailAddress {\n        emailAddress\n      }\n      orders(\n        first: $first\n        sortKey: PROCESSED_AT\n        reverse: true\n        query: $query\n      ) {\n        nodes {\n          ...CustomerOrderOwnership\n        }\n      }\n    }\n  }\n': {
    return: CustomerOrderOwnershipQuery;
    variables: CustomerOrderOwnershipQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment CustomerOrders on Customer {\n    orders(\n      sortKey: PROCESSED_AT,\n      reverse: true,\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor,\n      query: $query\n    ) {\n      nodes {\n        ...OrderItem\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        endCursor\n        startCursor\n      }\n    }\n  }\n  #graphql\n  fragment OrderItem on Order {\n    totalPrice {\n      amount\n      currencyCode\n    }\n    financialStatus\n    fulfillmentStatus\n    fulfillments(first: 1) {\n      nodes {\n        status\n      }\n    }\n    id\n    number\n    confirmationNumber\n    processedAt\n  }\n\n\n  query CustomerOrders(\n    $endCursor: String\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $query: String\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customer {\n      ...CustomerOrders\n    }\n  }\n': {
    return: CustomerOrdersQuery;
    variables: CustomerOrdersQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation customerAddressUpdate(\n    $address: CustomerAddressInput!\n    $addressId: ID!\n    $defaultAddress: Boolean\n    $language: LanguageCode\n ) @inContext(language: $language) {\n    customerAddressUpdate(\n      address: $address\n      addressId: $addressId\n      defaultAddress: $defaultAddress\n    ) {\n      customerAddress {\n        id\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressUpdateMutation;
    variables: CustomerAddressUpdateMutationVariables;
  };
  '#graphql\n  mutation customerAddressDelete(\n    $addressId: ID!\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customerAddressDelete(addressId: $addressId) {\n      deletedAddressId\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressDeleteMutation;
    variables: CustomerAddressDeleteMutationVariables;
  };
  '#graphql\n  mutation customerAddressCreate(\n    $address: CustomerAddressInput!\n    $defaultAddress: Boolean\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customerAddressCreate(\n      address: $address\n      defaultAddress: $defaultAddress\n    ) {\n      customerAddress {\n        id\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressCreateMutation;
    variables: CustomerAddressCreateMutationVariables;
  };
  '#graphql\n  mutation customerUpdate(\n    $customer: CustomerUpdateInput!\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    customerUpdate(input: $customer) {\n      customer {\n        firstName\n        lastName\n        emailAddress {\n          emailAddress\n        }\n        phoneNumber {\n          phoneNumber\n        }\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerUpdateMutation;
    variables: CustomerUpdateMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface CustomerAccountQueries extends GeneratedQueryTypes {}
  interface CustomerAccountMutations extends GeneratedMutationTypes {}
}
