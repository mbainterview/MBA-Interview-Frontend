"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Download, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentSubscription,
  subscriptionKeys,
} from "@/services/subscription.service";
import { invoicePdfUrl } from "@/services/payment.service";
import type { CurrentSubscription } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const TEXT_DARK = "#222c44";
const TEXT_BODY = "#5b5b6b";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionIdParam = searchParams.get("subscription_id");
  const qc = useQueryClient();

  // Poll the subscription endpoint until the webhook has activated the new plan.
  // "Activated" means: stripeSubscriptionId is set, status is active/trialing,
  // AND the plan is actually a paid plan. The plan check guards against a
  // stale row where the webhook hasn't yet rewritten `planId` off the free
  // default — otherwise we'd flash "Payment Successful" on the Free plan.
  const isActivated = (data: CurrentSubscription | undefined): boolean => {
    if (!data) return false;
    if (!data.stripeSubscriptionId) return false;
    if (data.status !== "active" && data.status !== "trialing") return false;
    const plan = data.plan;
    if (!plan) return false;
    if (plan.isDefault) return false;
    if (plan.priceInCents === 0) return false;
    return true;
  };

  const { data: subscription } = useCurrentSubscription({
    refetchInterval: (query) => (isActivated(query.state.data) ? false : 2000),
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    // Flush any stale /me/subscription cache so the poll below starts fresh.
    // Activation itself comes from the Stripe webhook — we only render success
    // once the webhook has written status=active/trialing to the DB.
    qc.invalidateQueries({ queryKey: subscriptionKeys.current() });
  }, [qc]);

  const activated = isActivated(subscription);

  const isTrial = subscription?.status === "trialing";
  const amountCents = subscription?.plan?.priceInCents ?? 0;
  const planName = subscription?.plan?.name ?? null;
  const trialEnd = subscription?.trialEndAt;
  const firstChargeAt = trialEnd ?? subscription?.currentPeriodEnd ?? null;
  const nextBilling = subscription?.nextChargeAt ?? subscription?.currentPeriodEnd;
  const invoiceId = subscription?.latestInvoiceId ?? null;

  const formatDate = (value: string | Date | null | undefined) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "\u2014";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md rounded-[20px] bg-white p-8 text-center"
        style={{ boxShadow: "0 12px 32px rgba(15, 11, 56, 0.08)" }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: PRIMARY, color: "white" }}
        >
          {activated ? <Check size={28} strokeWidth={3} /> : <Loader2 size={26} className="animate-spin" />}
        </div>

        <h1
          className="mt-4"
          style={{
            fontFamily: sora,
            fontSize: "24px",
            fontWeight: 700,
            color: TEXT_DARK,
          }}
        >
          {!activated
            ? "Finalizing your subscription\u2026"
            : isTrial
              ? "You're in! \u{1F389}"
              : "Payment Successful \u{1F389}"}
        </h1>

        {!activated && (
          <p
            className="mt-2"
            style={{ fontFamily: inter, fontSize: "13px", color: TEXT_BODY }}
          >
            This usually takes a few seconds. You can safely close this page —
            we&apos;ll email you once billing is confirmed.
          </p>
        )}

        {activated && isTrial && (
          <p
            className="mt-3"
            style={{
              fontFamily: inter,
              fontSize: "14px",
              color: TEXT_BODY,
              lineHeight: 1.55,
            }}
          >
            You&apos;ve subscribed to{" "}
            <strong style={{ color: TEXT_DARK }}>{planName}</strong>. You&apos;re
            currently in trial mode, so no payment has been deducted yet.
            {firstChargeAt && (
              <>
                {" "}
                Your first charge of{" "}
                <strong style={{ color: TEXT_DARK }}>
                  ${(amountCents / 100).toFixed(2)}
                </strong>{" "}
                will be processed on{" "}
                <strong style={{ color: TEXT_DARK }}>
                  {formatDate(firstChargeAt)}
                </strong>
                , after your trial ends.
              </>
            )}{" "}
            You can cancel anytime from the billing portal before then to avoid
            the charge.
          </p>
        )}

        {activated && (
          <div
            className="mt-6 flex flex-col gap-3 rounded-[12px] px-4 py-4 text-left"
            style={{ background: "rgba(15, 11, 56, 0.02)" }}
          >
            <div
              className="flex items-center justify-between"
              style={{ fontFamily: inter, fontSize: "13px" }}
            >
              <span style={{ color: TEXT_BODY }}>Plan Activated</span>
              <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                {planName ?? "\u2014"}
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              style={{ fontFamily: inter, fontSize: "13px" }}
            >
              <span style={{ color: TEXT_BODY }}>
                {isTrial ? "Amount Charged Today" : "Amount Paid"}
              </span>
              <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                {isTrial ? "$0.00 (trial)" : `$${(amountCents / 100).toFixed(2)}`}
              </span>
            </div>
            {isTrial && trialEnd && (
              <div
                className="flex items-center justify-between"
                style={{ fontFamily: inter, fontSize: "13px" }}
              >
                <span style={{ color: TEXT_BODY }}>Trial Ends</span>
                <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                  {formatDate(trialEnd)}
                </span>
              </div>
            )}
            <div
              className="flex items-center justify-between"
              style={{ fontFamily: inter, fontSize: "13px" }}
            >
              <span style={{ color: TEXT_BODY }}>
                {isTrial ? "First Charge On" : "Next Billing Date"}
              </span>
              <span style={{ color: TEXT_DARK, fontWeight: 600 }}>
                {formatDate(isTrial ? firstChargeAt : nextBilling)}
              </span>
            </div>
            {!isTrial && invoiceId && (
              <div
                className="flex items-center justify-between"
                style={{ fontFamily: inter, fontSize: "13px" }}
              >
                <span style={{ color: TEXT_BODY }}>Invoice ID</span>
                <span
                  style={{
                    color: TEXT_DARK,
                    fontWeight: 600,
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: "12px",
                  }}
                >
                  {invoiceId}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-[10px] text-white transition"
            style={{
              height: 44,
              fontFamily: sora,
              fontSize: "14px",
              fontWeight: 600,
              background: PRIMARY,
            }}
          >
            Go To Dashboard
          </button>

          {!isTrial && invoiceId && (
            <a
              href={invoicePdfUrl(invoiceId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] transition"
              style={{
                height: 44,
                fontFamily: sora,
                fontSize: "14px",
                fontWeight: 600,
                color: PRIMARY,
                background: "white",
                border: `1px solid ${PRIMARY}`,
              }}
            >
              <Download size={16} />
              Download Invoice
            </a>
          )}

          {!activated && subscriptionIdParam && (
            <Link
              href="/billing"
              className="inline-block text-center"
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: TEXT_BODY,
                textDecoration: "underline",
              }}
            >
              Go to Billing
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
