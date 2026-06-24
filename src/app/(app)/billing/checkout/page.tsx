"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { usePlans } from "@/services/subscription.service";
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

function buildFeatureList(plan: SubscriptionPlan): string[] {
  return plan.displayFeatures ?? [];
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("planSlug");
  const { data: plans, isLoading } = usePlans();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  const plan = (plans ?? []).find((p) => p.slug === planSlug);
  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1
          style={{
            fontFamily: sora,
            fontSize: "22px",
            fontWeight: 700,
            color: TEXT_DARK,
          }}
        >
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

  const price = plan.priceInCents;
  const tax = 0;
  const total = price + tax;
  const features = buildFeatureList(plan);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/billing"
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
        Review Your Plan
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "14px", color: TEXT_MUTED }}
      >
        Invest in your MBA interview success
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Plan summary card */}
        <div
          className="rounded-[18px] bg-white p-6"
          style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
        >
          <h2
            style={{
              fontFamily: sora,
              fontSize: "18px",
              fontWeight: 700,
              color: TEXT_DARK,
            }}
          >
            {plan.name}
          </h2>
          <p
            className="mt-1"
            style={{ fontFamily: inter, fontSize: "13px", color: TEXT_BODY }}
          >
            You can cancel any time from the billing portal.
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {features.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2.5"
                style={{ fontFamily: inter, fontSize: "13px", color: TEXT_BODY }}
              >
                <Check
                  size={18}
                  style={{ color: PRIMARY, flexShrink: 0, marginTop: 1 }}
                />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary sidebar */}
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

          <div
            className="mt-4 flex flex-col gap-3"
            style={{ fontFamily: inter, fontSize: "13px" }}
          >
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

          <button
            type="button"
            onClick={() => router.push(`/billing/payment?planSlug=${encodeURIComponent(plan.slug)}`)}
            className="mt-5 w-full rounded-[10px] text-white transition"
            style={{
              height: 44,
              fontFamily: sora,
              fontSize: "14px",
              fontWeight: 600,
              background: PRIMARY,
            }}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
