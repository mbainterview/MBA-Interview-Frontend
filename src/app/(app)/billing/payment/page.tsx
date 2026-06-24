"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { getStripe } from "@/lib/stripe";
import { usePlans } from "@/services/subscription.service";
import { useCreateSubscriptionIntent } from "@/services/payment.service";
import type { SubscriptionPlan } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const TEXT_DARK = "#222c44";
const TEXT_MUTED = "#9EA1C5";
const TEXT_BODY = "#5b5b6b";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function OrderSummary({ plan }: { plan: SubscriptionPlan }) {
  const price = plan.priceInCents;
  const tax = 0;
  const total = price + tax;
  return (
    <div
      className="rounded-[18px] bg-white p-6"
      style={{
        boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)",
        alignSelf: "flex-start",
      }}
    >
      <h2
        style={{
          fontFamily: sora,
          fontSize: "16px",
          fontWeight: 700,
          color: TEXT_DARK,
        }}
      >
        Order Summary
      </h2>

      <div className="mt-4 flex flex-col gap-3" style={{ fontFamily: inter, fontSize: "13px" }}>
        <div className="flex items-center justify-between">
          <span style={{ color: TEXT_BODY }}>Plan</span>
          <span style={{ color: TEXT_DARK, fontWeight: 600 }}>{plan.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: TEXT_BODY }}>Price</span>
          <span style={{ color: TEXT_DARK, fontWeight: 600 }}>{formatMoney(price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: TEXT_BODY }}>Tax</span>
          <span style={{ color: TEXT_DARK, fontWeight: 600 }}>{formatMoney(tax)}</span>
        </div>
        <div
          className="mt-2 flex items-center justify-between border-t pt-3"
          style={{ borderColor: "rgba(15, 11, 56, 0.08)" }}
        >
          <span
            style={{ fontFamily: sora, fontSize: "14px", color: TEXT_DARK, fontWeight: 700 }}
          >
            Total
          </span>
          <span
            style={{ fontFamily: sora, fontSize: "16px", color: TEXT_DARK, fontWeight: 700 }}
          >
            {formatMoney(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({
  subscriptionId,
  intentType,
}: {
  subscriptionId: string;
  intentType: "payment" | "setup";
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const confirmParams = {
      return_url: `${origin}/billing/success?subscription_id=${encodeURIComponent(subscriptionId)}`,
    };

    // Trial subscriptions return a SetupIntent (collect payment method, no
    // charge yet); paid-upfront subscriptions return a PaymentIntent.
    const { error } =
      intentType === "setup"
        ? await stripe.confirmSetup({ elements, confirmParams })
        : await stripe.confirmPayment({ elements, confirmParams });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
    // On success, Stripe navigates the browser to return_url — no client-side
    // post-success code runs here.
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] bg-white p-6" style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}>
      <h2
        style={{
          fontFamily: sora,
          fontSize: "16px",
          fontWeight: 700,
          color: TEXT_DARK,
        }}
      >
        Payment Details
      </h2>

      <div className="mt-5">
        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
            fields: { billingDetails: "auto" },
          }}
        />
      </div>

      {errorMessage && (
        <p
          className="mt-3"
          style={{
            fontFamily: inter,
            fontSize: "13px",
            color: "#ef4444",
          }}
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] text-white transition disabled:opacity-60"
        style={{
          height: 44,
          fontFamily: sora,
          fontSize: "14px",
          fontWeight: 600,
          background: PRIMARY,
        }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Processing\u2026" : "Continue to Payment"}
      </button>
    </form>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("planSlug");
  const { data: plans } = usePlans();
  const createIntent = useCreateSubscriptionIntent();

  const [intent, setIntent] = useState<{
    subscriptionId: string;
    clientSecret: string;
    intentType: "payment" | "setup";
  } | null>(null);

  const plan = useMemo(
    () => (plans ?? []).find((p) => p.slug === planSlug) ?? null,
    [plans, planSlug],
  );

  useEffect(() => {
    if (!planSlug || intent || createIntent.isPending) return;
    createIntent.mutate(
      { planSlug },
      {
        onSuccess: (data) =>
          setIntent({
            subscriptionId: data.subscriptionId,
            clientSecret: data.clientSecret,
            intentType: data.intentType,
          }),
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Could not start checkout",
          );
          router.replace(`/billing/checkout?planSlug=${encodeURIComponent(planSlug)}`);
        },
      },
    );
    // Only fire once per planSlug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planSlug]);

  const stripePromise = useMemo(() => getStripe(), []);

  if (!planSlug || !plan) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 style={{ fontFamily: sora, fontSize: "22px", fontWeight: 700, color: TEXT_DARK }}>
          Plan not found
        </h1>
        <Link
          href="/billing"
          className="mt-4 inline-flex items-center gap-1.5"
          style={{ fontFamily: inter, fontSize: "14px", color: PRIMARY }}
        >
          <ArrowLeft size={14} />
          Back to plans
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href={`/billing/checkout?planSlug=${encodeURIComponent(plan.slug)}`}
        className="inline-flex items-center gap-1.5"
        style={{ fontFamily: inter, fontSize: "14px", color: TEXT_BODY }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <h1
        className="mt-3"
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 700,
          color: TEXT_DARK,
          lineHeight: 1.2,
        }}
      >
        Card Details
      </h1>
      <p className="mt-1" style={{ fontFamily: inter, fontSize: "14px", color: TEXT_MUTED }}>
        Invest in your MBA interview success
      </p>

      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div
          className="mt-4 rounded-[12px] p-4"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            fontFamily: inter,
            fontSize: 13,
            color: "#991b1b",
          }}
        >
          Stripe publishable key is not configured. Set{" "}
          <code className="rounded bg-white px-1 py-0.5">
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          </code>{" "}
          in the frontend environment and redeploy — the payment form will
          stay blank until then.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          {!intent ? (
            <div
              className="flex h-90 items-center justify-center rounded-[18px] bg-white"
              style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
            >
              <Loader2 size={24} className="animate-spin" style={{ color: PRIMARY }} />
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: intent.clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: PRIMARY,
                    colorText: TEXT_DARK,
                    colorDanger: "#ef4444",
                    fontFamily: "Inter, system-ui, sans-serif",
                    borderRadius: "10px",
                    spacingUnit: "4px",
                  },
                },
              }}
            >
              <PaymentForm
                subscriptionId={intent.subscriptionId}
                intentType={intent.intentType}
              />
            </Elements>
          )}
        </div>
        <OrderSummary plan={plan} />
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  );
}
