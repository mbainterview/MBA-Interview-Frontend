"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { usePlans, useCurrentSubscription } from "@/services/subscription.service";
import { useCreatePortal } from "@/services/payment.service";
import { toast } from "sonner";
import type { SubscriptionPlan } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const TEXT_DARK = "#222c44";
const TEXT_MUTED = "#9EA1C5";
const TEXT_BODY = "#5b5b6b";

function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return "$0";
  const dollars = priceInCents / 100;
  return Number.isInteger(dollars)
    ? `$${dollars}`
    : `$${dollars.toFixed(2)}`;
}

function formatInterval(intervalMonths: number): string {
  if (intervalMonths <= 0) return "/forever";
  if (intervalMonths === 1) return "/per month";
  if (intervalMonths === 3) return "/per quarter";
  if (intervalMonths === 6) return "/six-month pass";
  if (intervalMonths === 12) return "/per year";
  return `/${intervalMonths} months`;
}

function ctaLabel(plan: SubscriptionPlan, isCurrent: boolean): string {
  if (isCurrent) return "Current Plan";
  if (plan.priceInCents === 0 || plan.isDefault) return "Start Free";
  return `Get ${plan.name}`;
}

function planTagline(plan: SubscriptionPlan): string {
  if (plan.description) return plan.description;
  return plan.priceInCents === 0
    ? "Get started with basic practice."
    : "Unlock premium features with this plan.";
}

export default function BillingPage() {
  const router = useRouter();
  const { data: plans, isLoading: plansLoading } = usePlans();
  // Force a fresh fetch every time the user lands here — the webhook may have
  // updated the plan since the last render, and a stale cache would show the
  // user the old (usually free) plan right after they paid.
  const { data: subscription, isLoading: subLoading } = useCurrentSubscription({
    refetchOnMount: "always",
    staleTime: 0,
  });
  const createPortal = useCreatePortal();

  const isLoading = plansLoading || subLoading;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Free / default plan is assigned implicitly — no checkout.
    if (plan.isDefault || plan.priceInCents === 0) return;
    if (subscription?.plan?.slug === plan.slug) return;
    router.push(`/billing/checkout?planSlug=${encodeURIComponent(plan.slug)}`);
  };

  const handleManagePaymentMethod = () => {
    if (createPortal.isPending) return;
    createPortal.mutate(undefined, {
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to open billing portal",
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  // Plans come from the backend pre-sorted by sortOrder + price, so we keep
  // that order as-is. Just filter out inactive entries defensively.
  const activePlans = (plans ?? []).filter((p) => p.isActive);
  const currentPlan = subscription?.plan ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 700,
          color: TEXT_DARK,
          lineHeight: 1.2,
        }}
      >
        Choose Your Plan
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "14px", color: TEXT_MUTED }}
      >
        Invest in your MBA interview success
      </p>

      {/* Plan cards */}
      {activePlans.length === 0 ? (
        <p
          className="mt-10 text-center"
          style={{ fontFamily: inter, fontSize: "15px", color: TEXT_BODY }}
        >
          No plans are available right now. Please check back later.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {activePlans.map((plan) => {
            const isFeatured = plan.isFeatured;
            const isCurrent = currentPlan?.slug === plan.slug;
            const priceLabel = formatPrice(plan.priceInCents);
            const intervalLabelStr = formatInterval(plan.intervalMonths);

            return (
              <div
                key={plan.id}
                className="relative flex flex-col overflow-hidden rounded-[18px] bg-white"
                style={{
                  boxShadow: isFeatured
                    ? "0 8px 28px rgba(84, 80, 216, 0.25)"
                    : "0 4px 14px rgba(15, 11, 56, 0.06)",
                  border: isFeatured
                    ? `2px solid ${PRIMARY}`
                    : "1px solid rgba(15, 11, 56, 0.06)",
                  transform: isFeatured ? "translateY(-8px)" : undefined,
                }}
              >
                {isFeatured && (
                  <div
                    className="flex h-[52px] items-center justify-center"
                    style={{
                      background: PRIMARY,
                      color: "white",
                      fontFamily: sora,
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div
                  className="flex flex-1 flex-col p-6"
                  style={{ paddingTop: isFeatured ? 24 : 32 }}
                >
                  <h2
                    className="text-center"
                    style={{
                      fontFamily: sora,
                      fontSize: "22px",
                      fontWeight: 700,
                      color: TEXT_DARK,
                    }}
                  >
                    {plan.name}
                  </h2>

                  <div className="mt-4 text-center">
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "44px",
                        fontWeight: 700,
                        color: TEXT_DARK,
                        lineHeight: 1,
                      }}
                    >
                      {priceLabel}
                    </span>
                    <span
                      style={{
                        fontFamily: inter,
                        fontSize: "14px",
                        color: TEXT_BODY,
                        marginLeft: 6,
                      }}
                    >
                      {intervalLabelStr}
                    </span>
                  </div>

                  <p
                    className="mt-3 text-center"
                    style={{
                      fontFamily: inter,
                      fontSize: "13px",
                      color: TEXT_BODY,
                      lineHeight: 1.45,
                      minHeight: 42,
                    }}
                  >
                    {planTagline(plan)}
                  </p>

                  <div
                    className="mt-5 border-t"
                    style={{ borderColor: "rgba(15, 11, 56, 0.08)" }}
                  />

                  <ul className="mt-5 flex flex-1 flex-col gap-3">
                    {(plan.displayFeatures ?? []).map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5"
                        style={{
                          fontFamily: inter,
                          fontSize: "13px",
                          color: TEXT_BODY,
                        }}
                      >
                        <Check
                          size={18}
                          style={{
                            color: PRIMARY,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent || plan.isDefault || plan.priceInCents === 0}
                    className="mt-6 w-full rounded-[10px] transition disabled:cursor-not-allowed"
                    style={{
                      height: 44,
                      fontFamily: sora,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isFeatured
                        ? "white"
                        : isCurrent
                          ? TEXT_MUTED
                          : PRIMARY,
                      background: isFeatured
                        ? PRIMARY
                        : isCurrent
                          ? "rgba(84, 80, 216, 0.05)"
                          : "rgba(84, 80, 216, 0.10)",
                      border: isFeatured
                        ? "none"
                        : `1px solid ${isCurrent ? "transparent" : "rgba(84, 80, 216, 0.2)"}`,
                    }}
                  >
                    {ctaLabel(plan, isCurrent)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Subscription block */}
      {subscription && (
        <div
          className="mt-10 rounded-[18px] bg-white p-6"
          style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
        >
          <h3
            style={{
              fontFamily: sora,
              fontSize: "18px",
              fontWeight: 700,
              color: TEXT_DARK,
            }}
          >
            Manage Subscription
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <div
              className="flex flex-col items-center justify-center rounded-[12px] p-4"
              style={{ background: "rgba(84, 80, 216, 0.06)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "#10b981", color: "white" }}
              >
                <Check size={20} />
              </div>
              <p
                className="mt-2"
                style={{
                  fontFamily: inter,
                  fontSize: "12px",
                  color: TEXT_BODY,
                }}
              >
                Current Plan
              </p>
              <p
                className="mt-0.5"
                style={{
                  fontFamily: sora,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: PRIMARY,
                }}
              >
                {currentPlan?.name ?? "Free"}
              </p>
            </div>

            <div
              className="rounded-[12px] p-4"
              style={{ background: "rgba(15, 11, 56, 0.02)" }}
            >
              <h4
                style={{
                  fontFamily: sora,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: TEXT_DARK,
                }}
              >
                Billing Info
              </h4>

              <div
                className="mt-3 flex flex-col gap-2"
                style={{ fontFamily: inter, fontSize: "13px" }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: TEXT_BODY }}>Next Charge</span>
                  <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                    {subscription.nextChargeAt
                      ? new Date(subscription.nextChargeAt).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )
                      : subscription.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd,
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "\u2014"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: TEXT_BODY }}>Payment Method</span>
                  <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                    {subscription.paymentMethodBrand &&
                    subscription.paymentMethodLast4
                      ? `${subscription.paymentMethodBrand.charAt(0).toUpperCase()}${subscription.paymentMethodBrand.slice(1)} **** ${subscription.paymentMethodLast4}`
                      : "\u2014"}
                  </span>
                </div>
              </div>

              {subscription.stripeCustomerId && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleManagePaymentMethod}
                    disabled={createPortal.isPending}
                    className="rounded-[10px] px-5 transition disabled:opacity-60"
                    style={{
                      height: 40,
                      fontFamily: sora,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: PRIMARY,
                      background: "white",
                      border: `1px solid ${PRIMARY}`,
                    }}
                  >
                    {createPortal.isPending
                      ? "Opening\u2026"
                      : "Change Payment Method"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
