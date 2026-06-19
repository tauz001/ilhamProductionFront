export const CUSTOMER_ORDER_FEEDBACK_OWNERSHIP_QUERY = `#graphql
  query CustomerOrderFeedbackOwnership(
    $first: Int!
    $query: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    customer {
      id
      orders(
        first: $first
        sortKey: PROCESSED_AT
        reverse: true
        query: $query
      ) {
        nodes {
          id
        }
      }
    }
  }
` as const;
