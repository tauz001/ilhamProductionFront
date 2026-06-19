/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    SAME_DAY_DELIVERY_ENABLED?: string;
    SAME_DAY_DELIVERY_FEE_INR?: string;
    SAME_DAY_DELIVERY_PINCODE_PREFIXES?: string;
    SAME_DAY_DELIVERY_VARIANT_ID?: string;
  }
}
