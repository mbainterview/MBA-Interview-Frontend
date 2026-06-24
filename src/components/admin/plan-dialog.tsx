"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreatePlan, useUpdatePlan } from "@/services/admin.service";
import type {
  CreatePlanInput,
  SubscriptionPlan,
  UpdatePlanInput,
} from "@/types/domain";

// Figma node 864:7685 — tokens sourced from the design exactly.
const SORA = "var(--font-sora), sans-serif";
const INTER = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const SUB_TEXT = "#868686";
const TEXT = "#272727";
const BORDER = "#b3b3b3";

const INTERVAL_OPTIONS = [
  { label: "Monthly", months: 1 },
  { label: "Quarterly", months: 3 },
  { label: "Semi-annual", months: 6 },
  { label: "Annual", months: 12 },
] as const;

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP"] as const;

interface PlanDialogProps {
  mode: "create" | "edit";
  plan?: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Empty-state defaults used for create mode; edit mode seeds from `plan`. */
const EMPTY_FORM = {
  name: "",
  description: "",
  intervalMonths: 1,
  priceDollars: "",
  currency: "USD",
  stripePriceId: "",
  displayFeatures: [] as string[],
  featureInput: "",
  isDefault: false,
  isFeatured: false,
  sortOrder: 0,
  trialDays: 0,
};

type FormState = typeof EMPTY_FORM;

export function PlanDialog({ mode, plan, open, onOpenChange }: PlanDialogProps) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // Seed form from `plan` when switching into edit mode (or when the dialog
  // opens for a different plan). Clear on close to prevent flashes of stale
  // copy on the next open.
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && plan) {
      setForm({
        name: plan.name,
        description: plan.description ?? "",
        intervalMonths: plan.intervalMonths > 0 ? plan.intervalMonths : 1,
        priceDollars: (plan.priceInCents / 100).toString(),
        currency: plan.currency || "USD",
        stripePriceId: plan.stripePriceId ?? "",
        displayFeatures: [...(plan.displayFeatures ?? [])],
        featureInput: "",
        isDefault: plan.isDefault,
        isFeatured: plan.isFeatured,
        sortOrder: plan.sortOrder,
        trialDays: plan.trialDays ?? 0,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, mode, plan]);

  const submitting = createPlan.isPending || updatePlan.isPending;

  const canSubmit = useMemo(() => {
    const priceNum = Number(form.priceDollars);
    return (
      form.name.trim().length > 0 &&
      !Number.isNaN(priceNum) &&
      priceNum >= 0 &&
      form.intervalMonths >= 0
    );
  }, [form.name, form.priceDollars, form.intervalMonths]);

  const addFeature = () => {
    const value = form.featureInput.trim();
    if (!value) return;
    if (form.displayFeatures.includes(value)) {
      setForm((f) => ({ ...f, featureInput: "" }));
      return;
    }
    setForm((f) => ({
      ...f,
      displayFeatures: [...f.displayFeatures, value],
      featureInput: "",
    }));
  };

  const removeFeature = (bullet: string) => {
    setForm((f) => ({
      ...f,
      displayFeatures: f.displayFeatures.filter((x) => x !== bullet),
    }));
  };

  const handleSubmit = () => {
    const priceInCents = Math.round(Number(form.priceDollars) * 100);
    if (!Number.isFinite(priceInCents) || priceInCents < 0) {
      setError("Price must be a non-negative number");
      return;
    }

    const trimmedStripePriceId = form.stripePriceId.trim();
    // Send `null` to clear the Stripe mapping; omit for create without a link.
    // A free/default plan has no price in Stripe, so we force-null it to avoid
    // an accidentally-attached price sending users to checkout on the free tier.
    const stripePriceIdValue =
      priceInCents === 0
        ? null
        : trimmedStripePriceId
          ? trimmedStripePriceId
          : null;

    const payload: CreatePlanInput & UpdatePlanInput = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priceInCents,
      intervalMonths: priceInCents === 0 ? 0 : form.intervalMonths,
      currency: form.currency,
      displayFeatures: form.displayFeatures,
      isDefault: form.isDefault,
      isFeatured: form.isFeatured,
      sortOrder: form.sortOrder,
      trialDays: priceInCents === 0 ? 0 : form.trialDays,
      stripePriceId: stripePriceIdValue,
    };

    if (mode === "create") {
      createPlan.mutate(payload as CreatePlanInput, {
        onSuccess: () => {
          toast.success(`Plan "${payload.name}" created`);
          onOpenChange(false);
        },
        onError: (err: unknown) =>
          setError(err instanceof Error ? err.message : "Failed to create plan"),
      });
    } else if (plan) {
      updatePlan.mutate(
        { id: plan.id, data: payload },
        {
          onSuccess: () => {
            toast.success(`Plan "${payload.name}" updated`);
            onOpenChange(false);
          },
          onError: (err: unknown) =>
            setError(err instanceof Error ? err.message : "Failed to update plan"),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // `max-h-[90vh] overflow-y-auto` makes the form scroll on short
        // viewports (mobile landscape, small laptops) instead of clipping the
        // footer buttons. Padding drops on mobile so input fields don't
        // squeeze into a sliver.
        className="flex max-h-[90vh] w-full max-w-[504px] flex-col overflow-y-auto p-6 sm:max-w-[504px] sm:p-10"
        showCloseButton={false}
      >
        {/* Header — Figma 864:7687 */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h2
              style={{
                fontFamily: SORA,
                fontSize: 20,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.3,
              }}
            >
              {mode === "create" ? "Create New Subscription Plan" : "Edit Subscription Plan"}
            </h2>
            <p
              style={{
                fontFamily: SORA,
                fontSize: 18,
                color: SUB_TEXT,
                lineHeight: 1.3,
                maxWidth: 404,
              }}
            >
              Define pricing, features, and access rules for this plan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="shrink-0 text-[#272727] transition-opacity hover:opacity-70"
          >
            <Icon icon="bitcoin-icons:cross-filled" width={24} height={24} />
          </button>
        </div>

        {/* Form sections */}
        <div className="mt-10 flex flex-col gap-8">
          {/* Plan Information */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Plan Information</FieldLabel>
            <FigmaInput
              placeholder="Plan Name (e.g, Pro MBA prep)"
              value={form.name}
              onChange={(value) => setForm((f) => ({ ...f, name: value }))}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Description</FieldLabel>
            <textarea
              placeholder="Add Description..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full resize-none outline-none"
              style={{
                height: 114,
                borderRadius: 12,
                border: `0.4px solid ${BORDER}`,
                padding: "16px 20px",
                fontFamily: INTER,
                fontSize: 16,
                color: TEXT,
                background: "#ffffff",
                lineHeight: "30px",
              }}
            />
          </div>

          {/* Pricing Details */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Pricing Details</FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row">
              <FigmaSelect
                value={form.intervalMonths}
                onChange={(v) => setForm((f) => ({ ...f, intervalMonths: v }))}
                options={INTERVAL_OPTIONS.map((o) => ({
                  label: o.label,
                  value: o.months,
                }))}
                className="flex-1"
              />
              <FigmaInput
                placeholder="$49"
                value={form.priceDollars}
                onChange={(value) =>
                  setForm((f) => ({ ...f, priceDollars: value }))
                }
                inputMode="decimal"
                className="flex-1"
              />
              <FigmaSelect
                value={form.currency}
                onChange={(v) => setForm((f) => ({ ...f, currency: String(v) }))}
                options={CURRENCY_OPTIONS.map((c) => ({ label: c, value: c }))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Stripe Price ID — required so the webhook handler can map this plan
              back from a paid Stripe subscription. Free plans ignore this. */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Stripe Price ID</FieldLabel>
            <FigmaInput
              placeholder="price_1AbCdEfGhIjKlMnOpQrStUv"
              value={form.stripePriceId}
              onChange={(value) =>
                setForm((f) => ({ ...f, stripePriceId: value }))
              }
            />
            <p
              style={{
                fontFamily: INTER,
                fontSize: 12,
                color: SUB_TEXT,
                lineHeight: 1.4,
              }}
            >
              Paste the recurring Price ID from your Stripe Dashboard
              (Products → this plan → Pricing). Without it, webhook handlers
              cannot match this plan and users fall back to Free after paying.
              Leave blank for the Free plan.
            </p>
          </div>

          {/* Add Feature */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Add Feature</FieldLabel>

            {form.displayFeatures.length > 0 && (
              <ul className="flex flex-col gap-2">
                {form.displayFeatures.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center justify-between gap-3 rounded-[12px] bg-[#f5f5fb] px-4 py-2.5"
                    style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
                  >
                    <span>{bullet}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(bullet)}
                      aria-label={`Remove feature ${bullet}`}
                      className="shrink-0 text-[#808080] hover:text-[#272727]"
                    >
                      <Icon icon="bitcoin-icons:cross-filled" width={18} height={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div
              className="flex items-center justify-between gap-2"
              style={{
                height: 60,
                borderRadius: 12,
                border: `0.4px solid ${BORDER}`,
                background: "#ffffff",
                padding: "16px 8px 16px 20px",
              }}
            >
              <input
                type="text"
                placeholder="Unlimited Mock Interviews"
                value={form.featureInput}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featureInput: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                className="flex-1 bg-transparent outline-none placeholder:text-[#868686]"
                style={{
                  fontFamily: INTER,
                  fontSize: 16,
                  color: TEXT,
                  lineHeight: "30px",
                }}
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!form.featureInput.trim()}
                className="shrink-0 capitalize text-white transition disabled:opacity-60"
                style={{
                  background: PRIMARY,
                  borderRadius: 16,
                  padding: "10px 24px",
                  fontFamily: INTER,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: "28px",
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Flags (not in Figma — needed for admin control over featured + default). */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Flags</FieldLabel>
            <label
              className="flex items-center justify-between gap-2"
              style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
            >
              <span>Mark as default (free) plan</span>
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
                disabled={Number(form.priceDollars) > 0}
                className="size-4 accent-[#5450d8]"
              />
            </label>
            <label
              className="flex items-center justify-between gap-2"
              style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
            >
              <span>Mark as &quot;Most Popular&quot;</span>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
                className="size-4 accent-[#5450d8]"
              />
            </label>
            <label
              className="flex items-center justify-between gap-2"
              style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
            >
              <span>Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="w-20 rounded-md border border-[#b3b3b3] px-2 py-1 text-right outline-none"
                style={{ fontFamily: INTER, fontSize: 14 }}
              />
            </label>
            <label
              className="flex items-center justify-between gap-2"
              style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
            >
              <span>
                Free trial (days)
                <span className="ml-1 text-[#868686]">— 0 = charge immediately</span>
              </span>
              <input
                type="number"
                min={0}
                value={form.trialDays}
                disabled={Number(form.priceDollars) === 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    trialDays: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="w-20 rounded-md border border-[#b3b3b3] px-2 py-1 text-right outline-none disabled:cursor-not-allowed disabled:bg-[#f5f5fb]"
                style={{ fontFamily: INTER, fontSize: 14 }}
              />
            </label>
          </div>

          {error && (
            <p
              style={{
                fontFamily: INTER,
                fontSize: 13,
                color: "#ef4444",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer buttons — Figma 864:7706. Full-width on mobile so the CTA
            never hides behind the viewport edge; fixed desktop width for Figma
            parity. */}
        <div className="mt-10 flex w-full items-center gap-2 sm:ml-auto sm:w-[342px]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 capitalize transition hover:bg-[#f5f5fb]"
            style={{
              height: 64,
              borderRadius: 16,
              border: `1px solid ${PRIMARY}`,
              fontFamily: INTER,
              fontSize: 18,
              fontWeight: 500,
              color: PRIMARY,
              lineHeight: "28px",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex-1 capitalize text-white transition disabled:opacity-60 sm:w-[182px] sm:flex-none"
            style={{
              height: 64,
              borderRadius: 16,
              background: PRIMARY,
              fontFamily: INTER,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create Plan"
                : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SORA,
        fontSize: 16,
        color: TEXT,
        lineHeight: "normal",
      }}
    >
      {children}
    </p>
  );
}

function FigmaInput({
  value,
  onChange,
  placeholder,
  inputMode,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full outline-none placeholder:text-[#868686] ${className ?? ""}`}
      style={{
        height: 60,
        borderRadius: 12,
        border: `0.4px solid ${BORDER}`,
        padding: "16px 20px",
        fontFamily: INTER,
        fontSize: 16,
        color: TEXT,
        background: "#ffffff",
        lineHeight: "30px",
      }}
    />
  );
}

function FigmaSelect<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{
        height: 60,
        borderRadius: 12,
        border: `0.4px solid ${BORDER}`,
        padding: "16px 20px",
        background: "#ffffff",
      }}
    >
      <select
        value={value}
        onChange={(e) => {
          const next =
            typeof value === "number"
              ? (Number(e.target.value) as unknown as T)
              : (e.target.value as T);
          onChange(next);
        }}
        className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
        style={{
          fontFamily: INTER,
          fontSize: 16,
          color: TEXT,
          lineHeight: "30px",
        }}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon
        icon="mingcute:down-line"
        width={24}
        height={24}
        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#272727]"
      />
    </div>
  );
}
