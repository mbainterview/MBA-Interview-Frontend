import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { CreateSubscriptionIntentResponse } from "@/types/domain";
import { subscriptionKeys } from "@/services/subscription.service";

// ─── Raw API calls ───────────────────────────────────────────────────────────

const paymentApi = {
  createSubscriptionIntent: (data: { planSlug: string }) =>
    apiClient
      .post<CreateSubscriptionIntentResponse>("/payments/subscription/create", data)
      .then((res) => res.data),

  createCheckout: (data: { planSlug: string }) =>
    apiClient
      .post<{ checkoutUrl: string }>("/payments/checkout", data)
      .then((res) => res.data),

  createPortal: () =>
    apiClient
      .post<{ portalUrl: string }>("/payments/portal")
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

/**
 * Create a Stripe subscription and receive a client secret the frontend
 * feeds to Stripe Elements. Primary path for the Elements-based checkout UI.
 */
export function useCreateSubscriptionIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.createSubscriptionIntent,
    retry: false,
    // Either outcome can change the user's subscription row server-side:
    // success creates a new Stripe subscription; a 409 means our reconcile
    // logic just synced a webhook-drifted DB row to "active". Refetch so the
    // /billing page reflects reality without a manual reload.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
}

/**
 * Legacy hosted Checkout — kept for fallback, no longer the default UX.
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: paymentApi.createCheckout,
    retry: false,
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: paymentApi.createPortal,
    retry: false,
    onSuccess: (data) => {
      window.location.href = data.portalUrl;
    },
  });
}

/**
 * Build a URL the browser can navigate to / open for the invoice PDF.
 * Backend endpoint 302s to Stripe's hosted invoice_pdf URL; we let the
 * browser follow the redirect.
 */
export function invoicePdfUrl(invoiceId: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5500/api/v1";
  return `${base}/payments/invoices/${invoiceId}/pdf`;
}
