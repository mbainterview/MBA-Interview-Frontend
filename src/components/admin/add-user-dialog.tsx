"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateUser } from "@/services/admin.service";

// Style tokens mirrored from plan-dialog.tsx for visual consistency.
const SORA = "var(--font-sora), sans-serif";
const INTER = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const SUB_TEXT = "#868686";
const TEXT = "#272727";
const BORDER = "#b3b3b3";

const ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Admin", value: "admin" },
] as const;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  role: "user" as "user" | "admin",
};

type FormState = typeof EMPTY_FORM;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const createUser = useCreateUser();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // Reset state whenever the dialog closes so a previous entry never leaks
  // into the next open (done here rather than in an effect).
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(EMPTY_FORM);
      setError(null);
    }
    onOpenChange(next);
  };

  const canSubmit = useMemo(
    () =>
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      EMAIL_REGEX.test(form.email.trim()),
    [form.firstName, form.lastName, form.email],
  );

  const handleSubmit = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();

    if (!firstName || !lastName) {
      setError("First and last name are required");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    createUser.mutate(
      { firstName, lastName, email, role: form.role },
      {
        onSuccess: () => {
          toast.success("User created — a temporary password was emailed");
          handleOpenChange(false);
        },
        onError: (err: unknown) => {
          // Surface the backend message (e.g. 409 "Email already registered").
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ??
            (err instanceof Error ? err.message : "Failed to create user");
          setError(
            Array.isArray(message) ? message.join(", ") : String(message),
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full max-w-[504px] flex-col overflow-y-auto p-6 sm:max-w-[504px] sm:p-10"
        showCloseButton={false}
      >
        {/* Header */}
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
              Add New User
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
              Create an account and email the user a temporary password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Close dialog"
            className="shrink-0 text-[#272727] transition-opacity hover:opacity-70"
          >
            <Icon icon="bitcoin-icons:cross-filled" width={24} height={24} />
          </button>
        </div>

        {/* Form */}
        <div className="mt-10 flex flex-col gap-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-3">
              <FieldLabel>First Name</FieldLabel>
              <FigmaInput
                placeholder="John"
                value={form.firstName}
                onChange={(value) =>
                  setForm((f) => ({ ...f, firstName: value }))
                }
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <FieldLabel>Last Name</FieldLabel>
              <FigmaInput
                placeholder="Doe"
                value={form.lastName}
                onChange={(value) =>
                  setForm((f) => ({ ...f, lastName: value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <FieldLabel>Email</FieldLabel>
            <FigmaInput
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={(value) => setForm((f) => ({ ...f, email: value }))}
              inputMode="email"
            />
          </div>

          <div className="flex flex-col gap-3">
            <FieldLabel>Role</FieldLabel>
            <FigmaSelect
              value={form.role}
              onChange={(v) =>
                setForm((f) => ({ ...f, role: v as "user" | "admin" }))
              }
              options={ROLE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </div>

          {error && (
            <p style={{ fontFamily: INTER, fontSize: 13, color: "#ef4444" }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 flex w-full items-center gap-2 sm:ml-auto sm:w-[342px]">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
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
            disabled={!canSubmit || createUser.isPending}
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
            {createUser.isPending ? "Creating…" : "Create User"}
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
