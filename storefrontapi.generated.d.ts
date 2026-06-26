/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type RawCartCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CartInput;
  numCartLines?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['Int']['input']
  >;
}>;

export type RawCartCreateMutation = {
  cartCreate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Cart,
        'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
      > & {
        appliedGiftCards: Array<
          Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
            amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          }
        >;
        buyerIdentity: Pick<
          StorefrontAPI.CartBuyerIdentity,
          'countryCode' | 'email' | 'phone'
        > & {
          customer?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Customer,
              'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
            >
          >;
        };
        lines: {
          nodes: Array<
            | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                parentRelationship?: StorefrontAPI.Maybe<{
                  parent: Pick<StorefrontAPI.CartLine, 'id'>;
                }>;
              })
            | (Pick<
                StorefrontAPI.ComponentizableCartLine,
                'id' | 'quantity'
              > & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                lineComponents: Array<
                  Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                    attributes: Array<
                      Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                    >;
                    cost: {
                      totalAmount: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      amountPerQuantity: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                    };
                    merchandise: Pick<
                      StorefrontAPI.ProductVariant,
                      'id' | 'availableForSale' | 'requiresShipping' | 'title'
                    > & {
                      compareAtPrice?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                      price: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'id' | 'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                      product: Pick<
                        StorefrontAPI.Product,
                        'handle' | 'title' | 'id' | 'vendor' | 'productType'
                      >;
                      selectedOptions: Array<
                        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                      >;
                    };
                    parentRelationship?: StorefrontAPI.Maybe<{
                      parent: Pick<StorefrontAPI.CartLine, 'id'>;
                    }>;
                  }
                >;
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<
            StorefrontAPI.MoneyV2,
            'currencyCode' | 'amount'
          >;
          totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          totalDutyAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
          totalTaxAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
        };
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        discountCodes: Array<
          Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
        >;
      }
    >;
    userErrors: Array<
      Pick<StorefrontAPI.CartUserError, 'field' | 'message' | 'code'>
    >;
    warnings: Array<
      Pick<StorefrontAPI.CartWarning, 'code' | 'message' | 'target'>
    >;
  }>;
};

export type RawCartLinesAddMutationVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
  lines: Array<StorefrontAPI.CartLineInput> | StorefrontAPI.CartLineInput;
  numCartLines?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['Int']['input']
  >;
}>;

export type RawCartLinesAddMutation = {
  cartLinesAdd?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Cart,
        'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
      > & {
        appliedGiftCards: Array<
          Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
            amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          }
        >;
        buyerIdentity: Pick<
          StorefrontAPI.CartBuyerIdentity,
          'countryCode' | 'email' | 'phone'
        > & {
          customer?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Customer,
              'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
            >
          >;
        };
        lines: {
          nodes: Array<
            | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                parentRelationship?: StorefrontAPI.Maybe<{
                  parent: Pick<StorefrontAPI.CartLine, 'id'>;
                }>;
              })
            | (Pick<
                StorefrontAPI.ComponentizableCartLine,
                'id' | 'quantity'
              > & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                lineComponents: Array<
                  Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                    attributes: Array<
                      Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                    >;
                    cost: {
                      totalAmount: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      amountPerQuantity: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                    };
                    merchandise: Pick<
                      StorefrontAPI.ProductVariant,
                      'id' | 'availableForSale' | 'requiresShipping' | 'title'
                    > & {
                      compareAtPrice?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                      price: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'id' | 'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                      product: Pick<
                        StorefrontAPI.Product,
                        'handle' | 'title' | 'id' | 'vendor' | 'productType'
                      >;
                      selectedOptions: Array<
                        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                      >;
                    };
                    parentRelationship?: StorefrontAPI.Maybe<{
                      parent: Pick<StorefrontAPI.CartLine, 'id'>;
                    }>;
                  }
                >;
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<
            StorefrontAPI.MoneyV2,
            'currencyCode' | 'amount'
          >;
          totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          totalDutyAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
          totalTaxAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
        };
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        discountCodes: Array<
          Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
        >;
      }
    >;
    userErrors: Array<
      Pick<StorefrontAPI.CartUserError, 'field' | 'message' | 'code'>
    >;
    warnings: Array<
      Pick<StorefrontAPI.CartWarning, 'code' | 'message' | 'target'>
    >;
  }>;
};

export type RawCartLinesUpdateMutationVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
  lines:
    | Array<StorefrontAPI.CartLineUpdateInput>
    | StorefrontAPI.CartLineUpdateInput;
  numCartLines?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['Int']['input']
  >;
}>;

export type RawCartLinesUpdateMutation = {
  cartLinesUpdate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Cart,
        'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
      > & {
        appliedGiftCards: Array<
          Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
            amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          }
        >;
        buyerIdentity: Pick<
          StorefrontAPI.CartBuyerIdentity,
          'countryCode' | 'email' | 'phone'
        > & {
          customer?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Customer,
              'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
            >
          >;
        };
        lines: {
          nodes: Array<
            | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                parentRelationship?: StorefrontAPI.Maybe<{
                  parent: Pick<StorefrontAPI.CartLine, 'id'>;
                }>;
              })
            | (Pick<
                StorefrontAPI.ComponentizableCartLine,
                'id' | 'quantity'
              > & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                lineComponents: Array<
                  Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                    attributes: Array<
                      Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                    >;
                    cost: {
                      totalAmount: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      amountPerQuantity: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                    };
                    merchandise: Pick<
                      StorefrontAPI.ProductVariant,
                      'id' | 'availableForSale' | 'requiresShipping' | 'title'
                    > & {
                      compareAtPrice?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                      price: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'id' | 'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                      product: Pick<
                        StorefrontAPI.Product,
                        'handle' | 'title' | 'id' | 'vendor' | 'productType'
                      >;
                      selectedOptions: Array<
                        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                      >;
                    };
                    parentRelationship?: StorefrontAPI.Maybe<{
                      parent: Pick<StorefrontAPI.CartLine, 'id'>;
                    }>;
                  }
                >;
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<
            StorefrontAPI.MoneyV2,
            'currencyCode' | 'amount'
          >;
          totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          totalDutyAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
          totalTaxAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
        };
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        discountCodes: Array<
          Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
        >;
      }
    >;
    userErrors: Array<
      Pick<StorefrontAPI.CartUserError, 'field' | 'message' | 'code'>
    >;
    warnings: Array<
      Pick<StorefrontAPI.CartWarning, 'code' | 'message' | 'target'>
    >;
  }>;
};

export type RawCartLinesRemoveMutationVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
  lineIds:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  numCartLines?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['Int']['input']
  >;
}>;

export type RawCartLinesRemoveMutation = {
  cartLinesRemove?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Cart,
        'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
      > & {
        appliedGiftCards: Array<
          Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
            amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          }
        >;
        buyerIdentity: Pick<
          StorefrontAPI.CartBuyerIdentity,
          'countryCode' | 'email' | 'phone'
        > & {
          customer?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Customer,
              'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
            >
          >;
        };
        lines: {
          nodes: Array<
            | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                parentRelationship?: StorefrontAPI.Maybe<{
                  parent: Pick<StorefrontAPI.CartLine, 'id'>;
                }>;
              })
            | (Pick<
                StorefrontAPI.ComponentizableCartLine,
                'id' | 'quantity'
              > & {
                attributes: Array<
                  Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                >;
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontAPI.MoneyV2,
                    'currencyCode' | 'amount'
                  >;
                  compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                };
                merchandise: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'requiresShipping' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontAPI.Product,
                    'handle' | 'title' | 'id' | 'vendor' | 'productType'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                };
                lineComponents: Array<
                  Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
                    attributes: Array<
                      Pick<StorefrontAPI.Attribute, 'key' | 'value'>
                    >;
                    cost: {
                      totalAmount: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      amountPerQuantity: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                    };
                    merchandise: Pick<
                      StorefrontAPI.ProductVariant,
                      'id' | 'availableForSale' | 'requiresShipping' | 'title'
                    > & {
                      compareAtPrice?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                      >;
                      price: Pick<
                        StorefrontAPI.MoneyV2,
                        'currencyCode' | 'amount'
                      >;
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'id' | 'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                      product: Pick<
                        StorefrontAPI.Product,
                        'handle' | 'title' | 'id' | 'vendor' | 'productType'
                      >;
                      selectedOptions: Array<
                        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                      >;
                    };
                    parentRelationship?: StorefrontAPI.Maybe<{
                      parent: Pick<StorefrontAPI.CartLine, 'id'>;
                    }>;
                  }
                >;
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<
            StorefrontAPI.MoneyV2,
            'currencyCode' | 'amount'
          >;
          totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          totalDutyAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
          totalTaxAmount?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
        };
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        discountCodes: Array<
          Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
        >;
      }
    >;
    userErrors: Array<
      Pick<StorefrontAPI.CartUserError, 'field' | 'message' | 'code'>
    >;
    warnings: Array<
      Pick<StorefrontAPI.CartWarning, 'code' | 'message' | 'target'>
    >;
  }>;
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<
      StorefrontAPI.Product,
      'handle' | 'title' | 'id' | 'vendor' | 'productType'
    >;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  parentRelationship?: StorefrontAPI.Maybe<{
    parent: Pick<StorefrontAPI.CartLine, 'id'>;
  }>;
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<
      StorefrontAPI.Product,
      'handle' | 'title' | 'id' | 'vendor' | 'productType'
    >;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  lineComponents: Array<
    Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
      attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
      cost: {
        totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        amountPerQuantity: Pick<
          StorefrontAPI.MoneyV2,
          'currencyCode' | 'amount'
        >;
        compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
      };
      merchandise: Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'requiresShipping' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        product: Pick<
          StorefrontAPI.Product,
          'handle' | 'title' | 'id' | 'vendor' | 'productType'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      };
      parentRelationship?: StorefrontAPI.Maybe<{
        parent: Pick<StorefrontAPI.CartLine, 'id'>;
      }>;
    }
  >;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          parentRelationship?: StorefrontAPI.Maybe<{
            parent: Pick<StorefrontAPI.CartLine, 'id'>;
          }>;
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          lineComponents: Array<
            Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
              cost: {
                totalAmount: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                amountPerQuantity: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
              };
              merchandise: Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'availableForSale' | 'requiresShipping' | 'title'
              > & {
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                product: Pick<
                  StorefrontAPI.Product,
                  'handle' | 'title' | 'id' | 'vendor' | 'productType'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              };
              parentRelationship?: StorefrontAPI.Maybe<{
                parent: Pick<StorefrontAPI.CartLine, 'id'>;
              }>;
            }
          >;
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
  announcementMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type StoreRobotsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StoreRobotsQuery = {shop: Pick<StorefrontAPI.Shop, 'id'>};

export type HomepageQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type HomepageQuery = {
  shop: {
    metafields: Array<
      StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Metafield,
          'key' | 'namespace' | 'value' | 'type'
        > & {
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
          }>;
        }
      >
    >;
  };
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'handle'
        | 'vendor'
        | 'productType'
        | 'tags'
        | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'title' | 'availableForSale'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              product: Pick<
                StorefrontAPI.Product,
                'id' | 'handle' | 'title' | 'vendor' | 'productType'
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
  };
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
  };
};

export type AboutVisualsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type AboutVisualsQuery = {
  shop: {
    metafields: Array<
      StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Metafield,
          'key' | 'namespace' | 'value' | 'type'
        > & {
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
          }>;
        }
      >
    >;
  };
  products: {
    nodes: Array<{
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }>;
  };
};

export type SameDayDeliveryVariantQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SameDayDeliveryVariantQuery = {
  node?: StorefrontAPI.Maybe<
    | {
        __typename:
          | 'AppliedGiftCard'
          | 'Article'
          | 'Blog'
          | 'Cart'
          | 'CartLine'
          | 'Collection'
          | 'Comment'
          | 'Company'
          | 'CompanyContact'
          | 'CompanyLocation'
          | 'ComponentizableCartLine'
          | 'ExternalVideo'
          | 'GenericFile'
          | 'Location'
          | 'MailingAddress'
          | 'Market'
          | 'MediaImage'
          | 'MediaPresentation'
          | 'Menu'
          | 'MenuItem';
      }
    | {
        __typename:
          | 'Metafield'
          | 'Metaobject'
          | 'Model3d'
          | 'Order'
          | 'Page'
          | 'Product'
          | 'ProductOption'
          | 'ProductOptionValue'
          | 'Shop'
          | 'ShopPayInstallmentsFinancingPlan'
          | 'ShopPayInstallmentsFinancingPlanTerm'
          | 'ShopPayInstallmentsProductVariantPricing'
          | 'ShopPolicy'
          | 'TaxonomyCategory'
          | 'UrlRedirect'
          | 'Video';
      }
    | ({__typename: 'ProductVariant'} & Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'title' | 'availableForSale'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'vendor' | 'productType'
          >;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
        })
  >;
};

export type LayoutCommerceQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type LayoutCommerceQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
  };
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'productType' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
  };
};

export type QuickViewProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type QuickViewProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'vendor' | 'productType'
    > & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<
              StorefrontAPI.Product,
              'id' | 'handle' | 'title' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      metafields: Array<
        StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
        >
      >;
    }
  >;
};

export type BagRecommendationsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type BagRecommendationsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >;
  };
};

export type ArticleQueryVariables = StorefrontAPI.Exact<{
  articleHandle: StorefrontAPI.Scalars['String']['input'];
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ArticleQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'handle'> & {
      articleByHandle?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Article,
          'handle' | 'title' | 'contentHtml' | 'publishedAt'
        > & {
          author?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ArticleAuthor, 'name'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'altText' | 'url' | 'width' | 'height'
            >
          >;
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        }
      >;
    }
  >;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
            blog: Pick<StorefrontAPI.Blog, 'handle'>;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
};

export type ArticleItemFragment = Pick<
  StorefrontAPI.Article,
  'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  blog: Pick<StorefrontAPI.Blog, 'handle'>;
};

export type BlogsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogsQuery = {
  blogs: {
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'title' | 'description'>
        >;
      }
    >;
  };
};

export type IlhamCollectionProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'title' | 'availableForSale'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<
    StorefrontAPI.Product,
    'id' | 'handle' | 'title' | 'vendor' | 'productType'
  >;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
};

export type IlhamCollectionProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'handle'
  | 'vendor'
  | 'productType'
  | 'tags'
  | 'availableForSale'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
    }
  >;
  variantsCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Count, 'count'>>;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.ProductVariant, 'id' | 'title' | 'availableForSale'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'vendor' | 'productType'
      >;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
    }
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  metafields: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
    >
  >;
};

export type CollectionQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  first: StorefrontAPI.Scalars['Int']['input'];
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      metafields: Array<
        StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
        >
      >;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            | 'id'
            | 'title'
            | 'handle'
            | 'vendor'
            | 'productType'
            | 'tags'
            | 'availableForSale'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            images: {
              nodes: Array<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            };
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'>
                >;
              }
            >;
            variantsCount?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Count, 'count'>
            >;
            selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'title' | 'availableForSale'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                product: Pick<
                  StorefrontAPI.Product,
                  'id' | 'handle' | 'title' | 'vendor' | 'productType'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            metafields: Array<
              StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
              >
            >;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'endCursor' | 'hasNextPage' | 'startCursor'
        >;
      };
    }
  >;
};

export type NewArrivalsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type NewArrivalsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'handle'
        | 'vendor'
        | 'productType'
        | 'tags'
        | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
          }
        >;
        variantsCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Count, 'count'>>;
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<
              StorefrontAPI.Product,
              'id' | 'handle' | 'title' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'endCursor' | 'hasNextPage' | 'startCursor'
    >;
  };
};

export type BestSellersQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type BestSellersQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'handle'
        | 'vendor'
        | 'productType'
        | 'tags'
        | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
          }
        >;
        variantsCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Count, 'count'>>;
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<
              StorefrontAPI.Product,
              'id' | 'handle' | 'title' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'endCursor' | 'hasNextPage' | 'startCursor'
    >;
  };
};

export type StoreCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StoreCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
  };
};

export type MoneyCollectionItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type CollectionItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'availableForSale'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type CatalogQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CatalogQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type ContactPageQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ContactPageQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  };
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'body' | 'bodySummary'>
  >;
};

export type GiftingCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type GiftingCollectionsQuery = {
  shop: {
    metafields: Array<
      StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Metafield,
          'key' | 'namespace' | 'value' | 'type'
        > & {
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
          }>;
        }
      >
    >;
  };
  giftingCollection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'vendor' | 'productType'
        > & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          images: {
            nodes: Array<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
          };
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          variants: {
            nodes: Array<
              Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'title' | 'availableForSale'
              > & {
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }
            >;
          };
        }
      >;
    };
  }>;
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'productType'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'title' | 'availableForSale'
            > & {
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
        };
      }
    >;
  };
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
  };
};

export type GiftPickerProductFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'vendor' | 'productType'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'title' | 'availableForSale'
      > & {
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      }
    >;
  };
};

export type AuthVisualQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type AuthVisualQuery = {
  products: {
    nodes: Array<{
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }>;
  };
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'handle' | 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type IlhamProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'title' | 'availableForSale' | 'currentlyNotInStock' | 'sku'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<
    StorefrontAPI.Product,
    'id' | 'handle' | 'title' | 'vendor' | 'productType'
  >;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
};

export type IlhamProductCardFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'handle'
  | 'vendor'
  | 'productType'
  | 'tags'
  | 'availableForSale'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'title' | 'availableForSale' | 'currentlyNotInStock' | 'sku'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        product: Pick<
          StorefrontAPI.Product,
          'id' | 'handle' | 'title' | 'vendor' | 'productType'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      }
    >;
  };
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  metafields: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
    >
  >;
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'productType'
      | 'descriptionHtml'
      | 'description'
      | 'tags'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale' | 'currentlyNotInStock' | 'sku'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<
              StorefrontAPI.Product,
              'id' | 'handle' | 'title' | 'vendor' | 'productType'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      metafields: Array<
        StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Metafield,
            'key' | 'namespace' | 'value' | 'type'
          > & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            }>;
          }
        >
      >;
    }
  >;
};

export type ProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  productId: StorefrontAPI.Scalars['ID']['input'];
}>;

export type ProductRecommendationsQuery = {
  productRecommendations?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'handle'
        | 'vendor'
        | 'productType'
        | 'tags'
        | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              | 'id'
              | 'title'
              | 'availableForSale'
              | 'currentlyNotInStock'
              | 'sku'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<
                StorefrontAPI.Product,
                'id' | 'handle' | 'title' | 'vendor' | 'productType'
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >
  >;
};

export type ProductRecommendationsFallbackQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductRecommendationsFallbackQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'title'
        | 'handle'
        | 'vendor'
        | 'productType'
        | 'tags'
        | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              | 'id'
              | 'title'
              | 'availableForSale'
              | 'currentlyNotInStock'
              | 'sku'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<
                StorefrontAPI.Product,
                'id' | 'handle' | 'title' | 'vendor' | 'productType'
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        metafields: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
      }
    >;
  };
};

export type SearchProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'handle' | 'id' | 'publishedAt' | 'title' | 'trackingParameters' | 'vendor'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
      }
    >;
  };

export type SearchPageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type SearchArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type PageInfoFragmentFragment = Pick<
  StorefrontAPI.PageInfo,
  'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
>;

export type RegularSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  term: StorefrontAPI.Scalars['String']['input'];
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type RegularSearchQuery = {
  articles: {
    nodes: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  pages: {
    nodes: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  products: {
    nodes: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        | 'handle'
        | 'id'
        | 'publishedAt'
        | 'title'
        | 'trackingParameters'
        | 'vendor'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PredictiveArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    blog: Pick<StorefrontAPI.Blog, 'handle'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictiveCollectionFragment = {__typename: 'Collection'} & Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictivePageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'id' | 'title' | 'handle' | 'trackingParameters'
>;

export type PredictiveProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }
    >;
  };

export type PredictiveQueryFragment = {
  __typename: 'SearchQuerySuggestion';
} & Pick<
  StorefrontAPI.SearchQuerySuggestion,
  'text' | 'styledText' | 'trackingParameters'
>;

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  limit: StorefrontAPI.Scalars['Int']['input'];
  limitScope: StorefrontAPI.PredictiveSearchLimitScope;
  term: StorefrontAPI.Scalars['String']['input'];
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    articles: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          blog: Pick<StorefrontAPI.Blog, 'handle'>;
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    collections: Array<
      {__typename: 'Collection'} & Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    pages: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'id' | 'title' | 'handle' | 'trackingParameters'
      >
    >;
    products: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        }
    >;
    queries: Array<
      {__typename: 'SearchQuerySuggestion'} & Pick<
        StorefrontAPI.SearchQuerySuggestion,
        'text' | 'styledText' | 'trackingParameters'
      >
    >;
  }>;
};

export type SignupVisualQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SignupVisualQuery = {
  products: {
    nodes: Array<{
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }>;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n    announcementMenu: menu(handle: "announcement-bar") {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n  query StoreRobots($country: CountryCode, $language: LanguageCode)\n   @inContext(country: $country, language: $language) {\n    shop {\n      id\n    }\n  }\n': {
    return: StoreRobotsQuery;
    variables: StoreRobotsQueryVariables;
  };
  '\n    #graphql\n    query Homepage {\n      shop {\n        metafields(identifiers: [\n          {namespace: "custom", key: "homepage_hero_1"},\n          {namespace: "custom", key: "custom_homepage_hero_1"},\n          {namespace: "custom", key: "homepage_hero_1_mobile"},\n          {namespace: "custom", key: "custom_homepage_hero_1_mobile"},\n          {namespace: "custom", key: "homepage_hero_2"},\n          {namespace: "custom", key: "custom_homepage_hero_2"},\n          {namespace: "custom", key: "homepage_hero_2_mobile"},\n          {namespace: "custom", key: "custom_homepage_hero_2_mobile"},\n          {namespace: "custom", key: "homepage_hero_3"},\n          {namespace: "custom", key: "custom_homepage_hero_3"},\n          {namespace: "custom", key: "homepage_hero_3_mobile"},\n          {namespace: "custom", key: "custom_homepage_hero_3_mobile"},\n          {namespace: "custom", key: "homepage_hero_4"},\n          {namespace: "custom", key: "custom_homepage_hero_4"},\n          {namespace: "custom", key: "homepage_hero_4_mobile"},\n          {namespace: "custom", key: "custom_homepage_hero_4_mobile"},\n          {namespace: "custom", key: "homepage_women_banner"},\n          {namespace: "custom", key: "custom_homepage_women_banner"},\n          {namespace: "custom", key: "homepage_men_banner"},\n          {namespace: "custom", key: "custom_homepage_men_banner"},\n          {namespace: "custom", key: "homepage_wedding_banner"},\n          {namespace: "custom", key: "custom_homepage_wedding_banner"},\n          {namespace: "custom", key: "homepage_wdding_banner"},\n          {namespace: "custom", key: "custom_homepage_wdding_banner"}\n        ]) {\n          key\n          namespace\n          value\n          type\n          reference {\n            ... on MediaImage {\n              image {\n                id\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n\n      products(first: 12, sortKey: CREATED_AT, reverse: true) {\n        nodes {\n          id\n          title\n          handle\n          vendor\n          productType\n          tags\n          availableForSale\n\n          featuredImage {\n            id\n            url\n            altText\n            width\n            height\n          }\n\n          images(first: 4) {\n            nodes {\n              id\n              url\n              altText\n              width\n              height\n            }\n          }\n\n          variants(first: 10) {\n            nodes {\n              id\n              title\n              availableForSale\n\n              image {\n                id\n                url\n                altText\n                width\n                height\n              }\n\n              product {\n                id\n                handle\n                title\n                vendor\n                productType\n              }\n\n              selectedOptions {\n                name\n                value\n              }\n\n              price {\n                amount\n                currencyCode\n              }\n            }\n          }\n\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n\n          metafields(identifiers: [{namespace: "custom", key: "subtitle"}]) {\n            key\n            namespace\n            value\n          }\n        }\n      }\n\n      collections(first: 10) {\n        nodes {\n          id\n          title\n          handle\n\n          image {\n            id\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n  ': {
    return: HomepageQuery;
    variables: HomepageQueryVariables;
  };
  '#graphql\n  query AboutVisuals($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      metafields(identifiers: [\n        {namespace: "custom", key: "about_hero"},\n        {namespace: "custom", key: "custom_about_hero"},\n        {namespace: "custom", key: "about_hero_mobile"},\n        {namespace: "custom", key: "custom_about_hero_mobile"},\n        {namespace: "custom", key: "about_artisan"},\n        {namespace: "custom", key: "custom_about_artisan"},\n        {namespace: "custom", key: "about_fabric"},\n        {namespace: "custom", key: "custom_about_fabric"},\n        {namespace: "custom", key: "about_editorial_1"},\n        {namespace: "custom", key: "custom_about_editorial_1"},\n        {namespace: "custom", key: "about_editorial_2"},\n        {namespace: "custom", key: "custom_about_editorial_2"}\n      ]) {\n        key\n        namespace\n        value\n        type\n        reference {\n          ... on MediaImage {\n            image {\n              id\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n    products(first: 5) {\n      nodes {\n        featuredImage {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n': {
    return: AboutVisualsQuery;
    variables: AboutVisualsQueryVariables;
  };
  '#graphql\n  query SameDayDeliveryVariant($id: ID!, $country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    node(id: $id) {\n      __typename\n      ... on ProductVariant {\n        id\n        title\n        availableForSale\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        product {\n          id\n          handle\n          title\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n  }\n': {
    return: SameDayDeliveryVariantQuery;
    variables: SameDayDeliveryVariantQueryVariables;
  };
  '#graphql\n  query LayoutCommerce($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    collections(first: 30) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        metafields(identifiers: [\n          {namespace: "custom", key: "tagline"},\n          {namespace: "custom", key: "category"}\n        ]) {\n          key\n          namespace\n          value\n        }\n      }\n    }\n    products(first: 50) {\n      nodes {\n        id\n        title\n        handle\n        vendor\n        productType\n        tags\n        featuredImage {\n          id\n          url\n          altText\n          width\n          height\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        metafields(identifiers: [\n          {namespace: "custom", key: "subtitle"},\n          {namespace: "custom", key: "fabric"},\n          {namespace: "custom", key: "color"},\n          {namespace: "custom", key: "occasions"}\n        ]) {\n          key\n          namespace\n          value\n        }\n      }\n    }\n  }\n': {
    return: LayoutCommerceQuery;
    variables: LayoutCommerceQueryVariables;
  };
  '#graphql\n  query QuickViewProduct(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      vendor\n      productType\n      featuredImage {\n        id\n        url\n        altText\n        width\n        height\n      }\n      images(first: 1) {\n        nodes {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n      variants(first: 50) {\n        nodes {\n          id\n          title\n          availableForSale\n          image {\n            id\n            url\n            altText\n            width\n            height\n          }\n          price {\n            amount\n            currencyCode\n          }\n          product {\n            id\n            handle\n            title\n            vendor\n            productType\n          }\n          selectedOptions {\n            name\n            value\n          }\n        }\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      metafields(identifiers: [\n        {namespace: "custom", key: "subtitle"}\n        {namespace: "custom", key: "fabric"}\n      ]) {\n        key\n        namespace\n        value\n      }\n    }\n  }\n': {
    return: QuickViewProductQuery;
    variables: QuickViewProductQueryVariables;
  };
  '#graphql\n  query BagRecommendations($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    products(first: 4, sortKey: BEST_SELLING) {\n      nodes {\n        id\n        handle\n        title\n        featuredImage {\n          url\n          altText\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n': {
    return: BagRecommendationsQuery;
    variables: BagRecommendationsQueryVariables;
  };
  '#graphql\n  query Article(\n    $articleHandle: String!\n    $blogHandle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    blog(handle: $blogHandle) {\n      handle\n      articleByHandle(handle: $articleHandle) {\n        handle\n        title\n        contentHtml\n        publishedAt\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        seo {\n          description\n          title\n        }\n      }\n    }\n  }\n': {
    return: ArticleQuery;
    variables: ArticleQueryVariables;
  };
  '#graphql\n  query Blog(\n    $language: LanguageCode\n    $blogHandle: String!\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      title\n      handle\n      seo {\n        title\n        description\n      }\n      articles(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor\n      ) {\n        nodes {\n          ...ArticleItem\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n\n      }\n    }\n  }\n  fragment ArticleItem on Article {\n    author: authorV2 {\n      name\n    }\n    contentHtml\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n    blog {\n      handle\n    }\n  }\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query Blogs(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    blogs(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      nodes {\n        title\n        handle\n        seo {\n          title\n          description\n        }\n      }\n    }\n  }\n': {
    return: BlogsQuery;
    variables: BlogsQueryVariables;
  };
  '#graphql\n  query Collection(\n    $country: CountryCode\n    $after: String\n    $first: Int!\n    $handle: String!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      seo {\n        title\n        description\n      }\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafields(identifiers: [\n        {namespace: "custom", key: "tagline"},\n        {namespace: "custom", key: "category"}\n      ]) {\n        key\n        namespace\n        value\n      }\n      products(first: $first, after: $after) {\n        nodes {\n          ...IlhamCollectionProduct\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          startCursor\n        }\n      }\n    }\n  }\n  #graphql\n  fragment IlhamCollectionProduct on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    availableForSale\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 3) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    variantsCount {\n      count\n    }\n    selectedOrFirstAvailableVariant {\n      ...IlhamCollectionProductVariant\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    metafields(identifiers: [\n      {namespace: "custom", key: "subtitle"},\n      {namespace: "custom", key: "fabric"},\n      {namespace: "custom", key: "color"},\n      {namespace: "custom", key: "color_hex"},\n      {namespace: "custom", key: "occasions"}\n    ]) {\n      key\n      namespace\n      value\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n\n': {
    return: CollectionQuery;
    variables: CollectionQueryVariables;
  };
  '#graphql\n  query NewArrivals(\n    $country: CountryCode\n    $after: String\n    $first: Int!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {\n      nodes {\n        ...IlhamCollectionProduct\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        startCursor\n      }\n    }\n  }\n  #graphql\n  fragment IlhamCollectionProduct on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    availableForSale\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 3) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    variantsCount {\n      count\n    }\n    selectedOrFirstAvailableVariant {\n      ...IlhamCollectionProductVariant\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    metafields(identifiers: [\n      {namespace: "custom", key: "subtitle"},\n      {namespace: "custom", key: "fabric"},\n      {namespace: "custom", key: "color"},\n      {namespace: "custom", key: "color_hex"},\n      {namespace: "custom", key: "occasions"}\n    ]) {\n      key\n      namespace\n      value\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n\n': {
    return: NewArrivalsQuery;
    variables: NewArrivalsQueryVariables;
  };
  '#graphql\n  query BestSellers(\n    $country: CountryCode\n    $after: String\n    $first: Int!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, after: $after, sortKey: BEST_SELLING) {\n      nodes {\n        ...IlhamCollectionProduct\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        startCursor\n      }\n    }\n  }\n  #graphql\n  fragment IlhamCollectionProduct on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    availableForSale\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 3) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    variantsCount {\n      count\n    }\n    selectedOrFirstAvailableVariant {\n      ...IlhamCollectionProductVariant\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    metafields(identifiers: [\n      {namespace: "custom", key: "subtitle"},\n      {namespace: "custom", key: "fabric"},\n      {namespace: "custom", key: "color"},\n      {namespace: "custom", key: "color_hex"},\n      {namespace: "custom", key: "occasions"}\n    ]) {\n      key\n      namespace\n      value\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n\n': {
    return: BestSellersQuery;
    variables: BestSellersQueryVariables;
  };
  '#graphql\n  query StoreCollections(\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collections(first: 50) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        metafields(identifiers: [\n          {namespace: "custom", key: "tagline"},\n          {namespace: "custom", key: "category"}\n        ]) {\n          key\n          namespace\n          value\n        }\n      }\n    }\n  }\n': {
    return: StoreCollectionsQuery;
    variables: StoreCollectionsQueryVariables;
  };
  '#graphql\n  query Catalog(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor,\n      sortKey: CREATED_AT,\n      reverse: true\n    ) {\n      nodes {\n        ...CollectionItem\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment MoneyCollectionItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment CollectionItem on Product {\n    id\n    handle\n    title\n    availableForSale\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyCollectionItem\n      }\n      maxVariantPrice {\n        ...MoneyCollectionItem\n      }\n    }\n  }\n\n': {
    return: CatalogQuery;
    variables: CatalogQueryVariables;
  };
  '#graphql\n  query ContactPage($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      name\n      description\n      primaryDomain {\n        url\n      }\n    }\n    page(handle: "contact") {\n      id\n      title\n      body\n      bodySummary\n    }\n  }\n': {
    return: ContactPageQuery;
    variables: ContactPageQueryVariables;
  };
  '#graphql\n  query GiftingCollections($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      metafields(identifiers: [\n        {namespace: "custom", key: "gifting_hero"},\n        {namespace: "custom", key: "custom_gifting_hero"},\n        {namespace: "custom", key: "gift_hero"},\n        {namespace: "custom", key: "custom_gift_hero"},\n        {namespace: "custom", key: "gifting_hero_mobile"},\n        {namespace: "custom", key: "custom_gifting_hero_mobile"},\n        {namespace: "custom", key: "gift_hero_mobile"},\n        {namespace: "custom", key: "custom_gift_hero_mobile"},\n        {namespace: "custom", key: "gifting_gift_box"},\n        {namespace: "custom", key: "custom_gifting_gift_box"},\n        {namespace: "custom", key: "for_him_gifting"},\n        {namespace: "custom", key: "custom_for_him_gifting"},\n        {namespace: "custom", key: "for_her_gifting"},\n        {namespace: "custom", key: "custom_for_her_gifting"},\n        {namespace: "custom", key: "wedding_gifting"},\n        {namespace: "custom", key: "custom_wedding_gifting"},\n        {namespace: "custom", key: "corporate_gifting"},\n        {namespace: "custom", key: "custom_corporate_gifting"},\n        {namespace: "custom", key: "gifting_service_variant_id"},\n        {namespace: "custom", key: "custom_gifting_service_variant_id"}\n      ]) {\n        key\n        namespace\n        value\n        type\n        reference {\n          ... on MediaImage {\n            image {\n              id\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n    giftingCollection: collection(handle: "luxury-gifting") {\n      products(first: 24) {\n        nodes {\n          ...GiftPickerProduct\n        }\n      }\n    }\n    products(first: 24) {\n      nodes {\n        ...GiftPickerProduct\n      }\n    }\n    collections(first: 30) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n\n  fragment GiftPickerProduct on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 3) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 20) {\n      nodes {\n        id\n        title\n        availableForSale\n        price {\n          amount\n          currencyCode\n        }\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n  }\n': {
    return: GiftingCollectionsQuery;
    variables: GiftingCollectionsQueryVariables;
  };
  '#graphql\n  query AuthVisual($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    products(first: 1, sortKey: BEST_SELLING) {\n      nodes {\n        featuredImage {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n': {
    return: AuthVisualQuery;
    variables: AuthVisualQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      title\n      vendor\n      handle\n      productType\n      descriptionHtml\n      description\n      tags\n      seo {\n        description\n        title\n      }\n      featuredImage {\n        id\n        url\n        altText\n        width\n        height\n      }\n      images(first: 12) {\n        nodes {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n      variants(first: 50) {\n        nodes {\n          ...IlhamProductVariant\n        }\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      metafields(identifiers: [\n        {namespace: "custom", key: "subtitle"},\n        {namespace: "custom", key: "fabric"},\n        {namespace: "custom", key: "care"},\n        {namespace: "custom", key: "craft_hours"},\n        {namespace: "custom", key: "artisan"},\n        {namespace: "custom", key: "origin"},\n        {namespace: "custom", key: "occasions"},\n        {namespace: "custom", key: "wash_care"},\n        {namespace: "custom", key: "reviews"},\n        {namespace: "custom", key: "shipping_returns"},\n        {namespace: "custom", key: "gifting_note"},\n        {namespace: "custom", key: "fabric_detail_image"},\n        {namespace: "custom", key: "artisan_image"},\n        {namespace: "custom", key: "audience"},\n        {namespace: "custom", key: "fit_note"},\n        {namespace: "custom", key: "size_chart"}\n      ]) {\n        key\n        namespace\n        value\n        type\n        reference {\n          ... on MediaImage {\n            image {\n              id\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query ProductRecommendations(\n    $country: CountryCode\n    $language: LanguageCode\n    $productId: ID!\n  ) @inContext(country: $country, language: $language) {\n    productRecommendations(productId: $productId) {\n      ...IlhamProductCard\n    }\n  }\n  #graphql\n  fragment IlhamProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    availableForSale\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 4) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    variants(first: 20) {\n      nodes {\n        ...IlhamProductVariant\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    metafields(identifiers: [{namespace: "custom", key: "subtitle"}]) {\n      key\n      namespace\n      value\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n\n': {
    return: ProductRecommendationsQuery;
    variables: ProductRecommendationsQueryVariables;
  };
  '#graphql\n  query ProductRecommendationsFallback(\n    $country: CountryCode\n    $first: Int!\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, sortKey: CREATED_AT, reverse: true) {\n      nodes {\n        ...IlhamProductCard\n      }\n    }\n  }\n  #graphql\n  fragment IlhamProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    productType\n    tags\n    availableForSale\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    images(first: 4) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    variants(first: 20) {\n      nodes {\n        ...IlhamProductVariant\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    metafields(identifiers: [{namespace: "custom", key: "subtitle"}]) {\n      key\n      namespace\n      value\n    }\n  }\n  #graphql\n  fragment IlhamProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    currentlyNotInStock\n    sku\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      id\n      handle\n      title\n      vendor\n      productType\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n\n': {
    return: ProductRecommendationsFallbackQuery;
    variables: ProductRecommendationsFallbackQueryVariables;
  };
  '#graphql\n  query RegularSearch(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $term: String!\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    articles: search(\n      query: $term,\n      types: [ARTICLE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Article {\n          ...SearchArticle\n        }\n      }\n    }\n    pages: search(\n      query: $term,\n      types: [PAGE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Page {\n          ...SearchPage\n        }\n      }\n    }\n    products: search(\n      after: $endCursor,\n      before: $startCursor,\n      first: $first,\n      last: $last,\n      query: $term,\n      sortKey: RELEVANCE,\n      types: [PRODUCT],\n      unavailableProducts: HIDE,\n    ) {\n      nodes {\n        ...on Product {\n          ...SearchProduct\n        }\n      }\n      pageInfo {\n        ...PageInfoFragment\n      }\n    }\n  }\n  #graphql\n  fragment SearchProduct on Product {\n    __typename\n    handle\n    id\n    publishedAt\n    title\n    trackingParameters\n    vendor\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n      compareAtPrice {\n        amount\n        currencyCode\n      }\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n        title\n      }\n    }\n  }\n\n  #graphql\n  fragment SearchPage on Page {\n     __typename\n     handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment SearchArticle on Article {\n    __typename\n    handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment PageInfoFragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n  }\n\n': {
    return: RegularSearchQuery;
    variables: RegularSearchQueryVariables;
  };
  '#graphql\n  query PredictiveSearch(\n    $country: CountryCode\n    $language: LanguageCode\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $term: String!\n    $types: [PredictiveSearchType!]\n  ) @inContext(country: $country, language: $language) {\n    predictiveSearch(\n      limit: $limit,\n      limitScope: $limitScope,\n      query: $term,\n      types: $types,\n    ) {\n      articles {\n        ...PredictiveArticle\n      }\n      collections {\n        ...PredictiveCollection\n      }\n      pages {\n        ...PredictivePage\n      }\n      products {\n        ...PredictiveProduct\n      }\n      queries {\n        ...PredictiveQuery\n      }\n    }\n  }\n  #graphql\n  fragment PredictiveArticle on Article {\n    __typename\n    id\n    title\n    handle\n    blog {\n      handle\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveCollection on Collection {\n    __typename\n    id\n    title\n    handle\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictivePage on Page {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveProduct on Product {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n  #graphql\n  fragment PredictiveQuery on SearchQuerySuggestion {\n    __typename\n    text\n    styledText\n    trackingParameters\n  }\n\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
  '#graphql\n  query SignupVisual($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    products(first: 1, sortKey: BEST_SELLING) {\n      nodes {\n        featuredImage {\n          id\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n': {
    return: SignupVisualQuery;
    variables: SignupVisualQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation RawCartCreate($input: CartInput!, $numCartLines: Int = 250) {\n    cartCreate(input: $input) {\n      cart {\n        ...CartApiQuery\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n  #graphql\n  fragment Money on MoneyV2 {\n    currencyCode\n    amount\n  }\n  fragment CartLine on CartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    parentRelationship {\n      parent {\n        id\n      }\n    }\n  }\n  fragment CartLineComponent on ComponentizableCartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    lineComponents {\n      ...CartLine\n    }\n  }\n  fragment CartApiQuery on Cart {\n    updatedAt\n    id\n    appliedGiftCards {\n      id\n      lastCharacters\n      amountUsed {\n        ...Money\n      }\n    }\n    checkoutUrl\n    totalQuantity\n    buyerIdentity {\n      countryCode\n      customer {\n        id\n        email\n        firstName\n        lastName\n        displayName\n      }\n      email\n      phone\n    }\n    lines(first: $numCartLines) {\n      nodes {\n        ...CartLine\n        ...CartLineComponent\n      }\n    }\n    cost {\n      subtotalAmount {\n        ...Money\n      }\n      totalAmount {\n        ...Money\n      }\n      totalDutyAmount {\n        ...Money\n      }\n      totalTaxAmount {\n        ...Money\n      }\n    }\n    note\n    attributes {\n      key\n      value\n    }\n    discountCodes {\n      code\n      applicable\n    }\n  }\n\n': {
    return: RawCartCreateMutation;
    variables: RawCartCreateMutationVariables;
  };
  '#graphql\n  mutation RawCartLinesAdd(\n    $cartId: ID!\n    $lines: [CartLineInput!]!\n    $numCartLines: Int = 250\n  ) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartApiQuery\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n  #graphql\n  fragment Money on MoneyV2 {\n    currencyCode\n    amount\n  }\n  fragment CartLine on CartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    parentRelationship {\n      parent {\n        id\n      }\n    }\n  }\n  fragment CartLineComponent on ComponentizableCartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    lineComponents {\n      ...CartLine\n    }\n  }\n  fragment CartApiQuery on Cart {\n    updatedAt\n    id\n    appliedGiftCards {\n      id\n      lastCharacters\n      amountUsed {\n        ...Money\n      }\n    }\n    checkoutUrl\n    totalQuantity\n    buyerIdentity {\n      countryCode\n      customer {\n        id\n        email\n        firstName\n        lastName\n        displayName\n      }\n      email\n      phone\n    }\n    lines(first: $numCartLines) {\n      nodes {\n        ...CartLine\n        ...CartLineComponent\n      }\n    }\n    cost {\n      subtotalAmount {\n        ...Money\n      }\n      totalAmount {\n        ...Money\n      }\n      totalDutyAmount {\n        ...Money\n      }\n      totalTaxAmount {\n        ...Money\n      }\n    }\n    note\n    attributes {\n      key\n      value\n    }\n    discountCodes {\n      code\n      applicable\n    }\n  }\n\n': {
    return: RawCartLinesAddMutation;
    variables: RawCartLinesAddMutationVariables;
  };
  '#graphql\n  mutation RawCartLinesUpdate(\n    $cartId: ID!\n    $lines: [CartLineUpdateInput!]!\n    $numCartLines: Int = 250\n  ) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartApiQuery\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n  #graphql\n  fragment Money on MoneyV2 {\n    currencyCode\n    amount\n  }\n  fragment CartLine on CartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    parentRelationship {\n      parent {\n        id\n      }\n    }\n  }\n  fragment CartLineComponent on ComponentizableCartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    lineComponents {\n      ...CartLine\n    }\n  }\n  fragment CartApiQuery on Cart {\n    updatedAt\n    id\n    appliedGiftCards {\n      id\n      lastCharacters\n      amountUsed {\n        ...Money\n      }\n    }\n    checkoutUrl\n    totalQuantity\n    buyerIdentity {\n      countryCode\n      customer {\n        id\n        email\n        firstName\n        lastName\n        displayName\n      }\n      email\n      phone\n    }\n    lines(first: $numCartLines) {\n      nodes {\n        ...CartLine\n        ...CartLineComponent\n      }\n    }\n    cost {\n      subtotalAmount {\n        ...Money\n      }\n      totalAmount {\n        ...Money\n      }\n      totalDutyAmount {\n        ...Money\n      }\n      totalTaxAmount {\n        ...Money\n      }\n    }\n    note\n    attributes {\n      key\n      value\n    }\n    discountCodes {\n      code\n      applicable\n    }\n  }\n\n': {
    return: RawCartLinesUpdateMutation;
    variables: RawCartLinesUpdateMutationVariables;
  };
  '#graphql\n  mutation RawCartLinesRemove(\n    $cartId: ID!\n    $lineIds: [ID!]!\n    $numCartLines: Int = 250\n  ) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        ...CartApiQuery\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n      warnings {\n        code\n        message\n        target\n      }\n    }\n  }\n  #graphql\n  fragment Money on MoneyV2 {\n    currencyCode\n    amount\n  }\n  fragment CartLine on CartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    parentRelationship {\n      parent {\n        id\n      }\n    }\n  }\n  fragment CartLineComponent on ComponentizableCartLine {\n    id\n    quantity\n    attributes {\n      key\n      value\n    }\n    cost {\n      totalAmount {\n        ...Money\n      }\n      amountPerQuantity {\n        ...Money\n      }\n      compareAtAmountPerQuantity {\n        ...Money\n      }\n    }\n    merchandise {\n      ... on ProductVariant {\n        id\n        availableForSale\n        compareAtPrice {\n          ...Money\n        }\n        price {\n          ...Money\n        }\n        requiresShipping\n        title\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        product {\n          handle\n          title\n          id\n          vendor\n          productType\n        }\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n    lineComponents {\n      ...CartLine\n    }\n  }\n  fragment CartApiQuery on Cart {\n    updatedAt\n    id\n    appliedGiftCards {\n      id\n      lastCharacters\n      amountUsed {\n        ...Money\n      }\n    }\n    checkoutUrl\n    totalQuantity\n    buyerIdentity {\n      countryCode\n      customer {\n        id\n        email\n        firstName\n        lastName\n        displayName\n      }\n      email\n      phone\n    }\n    lines(first: $numCartLines) {\n      nodes {\n        ...CartLine\n        ...CartLineComponent\n      }\n    }\n    cost {\n      subtotalAmount {\n        ...Money\n      }\n      totalAmount {\n        ...Money\n      }\n      totalDutyAmount {\n        ...Money\n      }\n      totalTaxAmount {\n        ...Money\n      }\n    }\n    note\n    attributes {\n      key\n      value\n    }\n    discountCodes {\n      code\n      applicable\n    }\n  }\n\n': {
    return: RawCartLinesRemoveMutation;
    variables: RawCartLinesRemoveMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
