import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Single `loadStripe` promise shared across the app. Stripe.js is heavy —
 * calling `loadStripe` multiple times would create multiple script injections.
 */
let cached: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (cached) return cached;

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    if (typeof window !== "undefined") {
      console.warn(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — Stripe Elements will not render.",
      );
    }
    cached = Promise.resolve(null);
    return cached;
  }

  cached = loadStripe(key);
  return cached;
}
