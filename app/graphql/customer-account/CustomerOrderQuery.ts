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

// A smaller order-detail query used when Shopify refuses richer private fields
// such as transaction details or deep fulfillment events. This mirrors the
// fields Shopify's Customer Account API commonly allows for customer-facing
// order detail pages, so the page can still render without weakening privacy.
export const CUSTOMER_ORDER_SAFE_QUERY = `#graphql
  fragment SafeOrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment SafeDiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        ...SafeOrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment SafeOrderLineItemFull on LineItem {
    id
    title
    quantity
    sku
    requiresShipping
    price {
      ...SafeOrderMoney
    }
    currentTotalPrice {
      ...SafeOrderMoney
    }
    soldTotalPrice {
      ...SafeOrderMoney
    }
    totalDiscount {
      ...SafeOrderMoney
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
  fragment SafeOrder on Order {
    id
    name
    number
    confirmationNumber
    statusPageUrl
    financialStatus
    fulfillmentStatus
    processedAt
    requiresShipping
    fulfillments(first: 5, sortKey: CREATED_AT) {
      nodes {
        id
        status
        createdAt
        estimatedDeliveryAt
        trackingInformation {
          company
          number
          url
        }
      }
    }
    totalTax {
      ...SafeOrderMoney
    }
    totalPrice {
      ...SafeOrderMoney
    }
    subtotal {
      ...SafeOrderMoney
    }
    shippingAddress {
      name
      formatted(withName: true)
      formattedArea
    }
    discountApplications(first: 100) {
      nodes {
        ...SafeDiscountApplication
      }
    }
    lineItems(first: 100) {
      nodes {
        ...SafeOrderLineItemFull
      }
    }
  }
  query SafeOrder($orderId: ID!, $language: LanguageCode)
    @inContext(language: $language) {
    order(id: $orderId) {
      ... on Order {
        ...SafeOrder
      }
    }
  }
` as const;

// Some Customer Account API sessions return a blank result for the top-level
// order(id:) lookup even when the same order is visible in customer.orders.
// This query keeps the lookup customer-owned by fetching only the signed-in
// customer's orders, then the route matches the requested ID in server code.
export const CUSTOMER_ORDER_FROM_CUSTOMER_QUERY = `#graphql
  fragment CustomerOwnedOrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment CustomerOwnedDiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        ...CustomerOwnedOrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment CustomerOwnedOrderLineItem on LineItem {
    id
    title
    quantity
    sku
    requiresShipping
    price {
      ...CustomerOwnedOrderMoney
    }
    currentTotalPrice {
      ...CustomerOwnedOrderMoney
    }
    soldTotalPrice {
      ...CustomerOwnedOrderMoney
    }
    totalDiscount {
      ...CustomerOwnedOrderMoney
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
  fragment CustomerOwnedOrder on Order {
    id
    name
    number
    confirmationNumber
    statusPageUrl
    financialStatus
    fulfillmentStatus
    processedAt
    updatedAt
    requiresShipping
    shippingTitle
    fulfillments(first: 5, sortKey: CREATED_AT) {
      nodes {
        id
        status
        createdAt
        updatedAt
        estimatedDeliveryAt
        trackingInformation {
          company
          number
          url
        }
      }
    }
    totalTax {
      ...CustomerOwnedOrderMoney
    }
    totalShipping {
      ...CustomerOwnedOrderMoney
    }
    totalRefunded {
      ...CustomerOwnedOrderMoney
    }
    totalPrice {
      ...CustomerOwnedOrderMoney
    }
    subtotal {
      ...CustomerOwnedOrderMoney
    }
    shippingAddress {
      name
      formatted(withName: true)
      formattedArea
    }
    discountApplications(first: 100) {
      nodes {
        ...CustomerOwnedDiscountApplication
      }
    }
    lineItems(first: 100) {
      nodes {
        ...CustomerOwnedOrderLineItem
      }
    }
  }
  query CustomerOrderFromCustomer(
    $first: Int
    $query: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    customer {
      orders(
        first: $first
        sortKey: PROCESSED_AT
        reverse: true
        query: $query
      ) {
        nodes {
          ...CustomerOwnedOrder
        }
      }
    }
  }
` as const;

// Ownership probe: this intentionally asks for only the same kind of fields
// used by the working order-list page, plus the signed-in customer's email.
// If Shopify will not expose the richer detail query, the route can still
// prove the requested order belongs to this customer before using a private
// server-side fallback.
export const CUSTOMER_ORDER_OWNERSHIP_QUERY = `#graphql
  fragment CustomerOrderOwnershipMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment CustomerOrderOwnership on Order {
    id
    name
    number
    confirmationNumber
    statusPageUrl
    financialStatus
    fulfillmentStatus
    processedAt
    updatedAt
    totalPrice {
      ...CustomerOrderOwnershipMoney
    }
    fulfillments(first: 1) {
      nodes {
        id
        status
      }
    }
  }
  query CustomerOrderOwnership(
    $first: Int
    $query: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    customer {
      emailAddress {
        emailAddress
      }
      orders(
        first: $first
        sortKey: PROCESSED_AT
        reverse: true
        query: $query
      ) {
        nodes {
          ...CustomerOrderOwnership
        }
      }
    }
  }
` as const;
