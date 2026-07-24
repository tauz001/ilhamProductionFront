/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    DISCOUNT_TICKET_TAG?: string;
    PRIVATE_SHOPIFY_ADMIN_API_TOKEN?: string;
    PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?: string;
    PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?: string;
    SAME_DAY_DELIVERY_ENABLED?: string;
    SAME_DAY_DELIVERY_FEE_INR?: string;
    SAME_DAY_DELIVERY_PINCODE_PREFIXES?: string;
    SAME_DAY_DELIVERY_VARIANT_ID?: string;
  }
}
