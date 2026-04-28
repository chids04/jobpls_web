export const FEATURES = {
  payments: import.meta.env.VITE_FEATURE_PAYMENTS === "true",
  hostedFreeTier: import.meta.env.VITE_FEATURE_HOSTED_FREE === "true",
} as const;
