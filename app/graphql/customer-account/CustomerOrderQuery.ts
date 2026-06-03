// NOTE: https://shopify.dev/docs/api/customer/latest/queries/order
export const CUSTOMER_ORDER_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        ...OrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment OrderLineItemFull on LineItem {
    id
    title
    quantity
    sku
    requiresShipping
    price {
      ...OrderMoney
    }
    currentTotalPrice {
      ...OrderMoney
    }
    soldTotalPrice {
      ...OrderMoney
    }
    discountAllocations {
      allocatedAmount {
        ...OrderMoney
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    totalDiscount {
      ...OrderMoney
    }
    image {
      altText
      height
      url
      id
      width
    }
    variantTitle
  }
  fragment Order on Order {
    id
    name
    confirmationNumber
    statusPageUrl
    financialStatus
    fulfillmentStatus
    processedAt
    updatedAt
    requiresShipping
    shippingTitle
    fulfillments(first: 10, sortKey: CREATED_AT) {
      nodes {
        id
        status
        latestShipmentStatus
        createdAt
        updatedAt
        estimatedDeliveryAt
        requiresShipping
        trackingInformation {
          company
          number
          url
        }
        events(first: 10, sortKey: HAPPENED_AT, reverse: true) {
          nodes {
            id
            status
            happenedAt
          }
        }
        fulfillmentLineItems(first: 20) {
          nodes {
            id
            quantity
            lineItem {
              id
              title
              variantTitle
              image {
                altText
                height
                url
                id
                width
              }
            }
          }
        }
      }
    }
    totalTax {
      ...OrderMoney
    }
    totalShipping {
      ...OrderMoney
    }
    totalRefunded {
      ...OrderMoney
    }
    totalPrice {
      ...OrderMoney
    }
    subtotal {
      ...OrderMoney
    }
    shippingAddress {
      name
      formatted(withName: true)
      formattedArea
    }
    discountApplications(first: 100) {
      nodes {
        ...DiscountApplication
      }
    }
    transactions {
      id
      kind
      status
      type
      processedAt
      transactionAmount {
        presentmentMoney {
          ...OrderMoney
        }
      }
    }
    lineItems(first: 100) {
      nodes {
        ...OrderLineItemFull
      }
    }
  }
  query Order($orderId: ID!, $language: LanguageCode)
    @inContext(language: $language) {
    order(id: $orderId) {
      ... on Order {
        ...Order
      }
    }
  }
` as const;
