"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useCreateAdminNotificationTemplate,
  usePreviewAdminNotificationTemplate,
  useUpdateAdminNotificationTemplate,
} from "@/services/admin.service";
import {
  TRIGGER_EVENTS,
  TRIGGER_EVENT_LABELS,
  TRIGGER_EVENT_VARIABLES,
  type CreateNotificationTemplateInput,
  type NotificationTemplate,
  type TriggerEvent,
  type UpdateNotificationTemplateInput,
} from "@/types/domain";

const SORA = "var(--font-sora), sans-serif";
const INTER = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const SUB_TEXT = "#868686";
const TEXT = "#272727";
const BORDER = "#b3b3b3";

interface NotificationTemplateDialogProps {
  mode: "create" | "edit";
  template?: NotificationTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  key: string;
  name: string;
  triggerEvent: TriggerEvent;
  emailSubject: string;
  emailBody: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  key: "",
  name: "",
  triggerEvent: "on_signup",
  emailSubject: "",
  emailBody: "",
  isActive: true,
};

// snake_case, starts with a letter, total 3–80 chars
const KEY_PATTERN = /^[a-z][a-z0-9_]{1,78}[a-z0-9]$/;

/**
 * Outer wrapper. Uses a `key` on the inner form so that each open / each
 * switch between create/edit naturally remounts with fresh initial state.
 * That avoids a `useEffect(setState, [props])` pattern (cascading-render
 * warning) while still giving us Figma-parity behavior: opening the dialog
 * always starts from a clean form seeded from the current props.
 */
export function NotificationTemplateDialog(
  props: NotificationTemplateDialogProps,
) {
  const { open, onOpenChange } = props;
  // Don't render the form until the dialog is open — saves on hook work and
  // guarantees the form's initial state matches props at open time.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // NB: shadcn's DialogContent has a default `sm:max-w-sm` (384px) that
        // wins over a plain `max-w-[720px]`. We have to restate the cap at the
        // sm breakpoint (and lg for even larger screens) so the form has room
        // for the two-column "Name + Key" row without wrapping.
        className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-y-auto p-6 sm:max-w-180 sm:p-10 lg:max-w-190"
        showCloseButton={false}
      >
        {open && (
          <TemplateForm
            key={`${props.mode}:${props.template?.id ?? "new"}`}
            mode={props.mode}
            template={props.template}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function seedFormState(
  mode: "create" | "edit",
  template: NotificationTemplate | null | undefined,
): FormState {
  if (mode === "edit" && template) {
    return {
      key: template.key,
      name: template.name,
      triggerEvent: template.triggerEvent,
      emailSubject: template.emailSubject,
      emailBody: template.emailBody,
      isActive: template.isActive,
    };
  }
  return EMPTY_FORM;
}

function TemplateForm({
  mode,
  template,
  onClose,
}: {
  mode: "create" | "edit";
  template?: NotificationTemplate | null;
  onClose: () => void;
}) {
  const createTemplate = useCreateAdminNotificationTemplate();
  const updateTemplate = useUpdateAdminNotificationTemplate();
  const previewTemplate = usePreviewAdminNotificationTemplate();

  // Initial state is derived once at mount — re-seeds whenever the parent
  // changes the key, which happens on every open / mode change.
  const [form, setForm] = useState<FormState>(() =>
    seedFormState(mode, template),
  );
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  // Ref on the HTML-body textarea so we can insert `{{token}}` at the caret
  // instead of making the admin type it or paste it.
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const availableVariables = TRIGGER_EVENT_VARIABLES[form.triggerEvent] ?? [];

  const submitting = createTemplate.isPending || updateTemplate.isPending;

  const canSubmit = useMemo(() => {
    const keyOk = mode === "edit" || KEY_PATTERN.test(form.key);
    return (
      keyOk &&
      form.name.trim().length > 0 &&
      form.emailSubject.trim().length > 0 &&
      form.emailBody.trim().length > 0
    );
  }, [form.key, form.name, form.emailSubject, form.emailBody, mode]);

  /**
   * Insert `{{token}}` at the current caret position in the HTML-body
   * textarea (or append to the end if the textarea isn't focused). Updates
   * form state and refocuses so the admin can keep typing.
   */
  const insertTokenIntoBody = (variableName: string) => {
    const token = `{{${variableName}}}`;
    const el = bodyRef.current;
    if (!el) {
      setForm((f) => ({ ...f, emailBody: f.emailBody + token }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const nextValue = before + token + after;
    setForm((f) => ({ ...f, emailBody: nextValue }));
    // Restore caret to just after the inserted token on the next tick so the
    // textarea has already rendered the new value.
    requestAnimationFrame(() => {
      const caret = start + token.length;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const handleSubmit = () => {
    const payload: CreateNotificationTemplateInput & UpdateNotificationTemplateInput = {
      key: form.key.trim(),
      name: form.name.trim(),
      triggerEvent: form.triggerEvent,
      emailSubject: form.emailSubject.trim(),
      emailBody: form.emailBody,
      // Variables are preserved from the original template in edit mode (so
      // round-tripping doesn't clear them), or defaulted to [] in create.
      variables: template?.variables ?? [],
      isActive: form.isActive,
    };

    if (mode === "create") {
      createTemplate.mutate(payload as CreateNotificationTemplateInput, {
        onSuccess: () => {
          toast.success(`Template "${payload.name}" created`);
          onClose();
        },
        onError: (err: unknown) =>
          setError(err instanceof Error ? err.message : "Failed to create template"),
      });
    } else if (template) {
      // Don't resend `key` in edit mode — backend treats it as immutable.
      const { key: _omit, ...patch } = payload;
      void _omit;
      updateTemplate.mutate(
        { id: template.id, data: patch },
        {
          onSuccess: () => {
            toast.success(`Template "${payload.name}" updated`);
            onClose();
          },
          onError: (err: unknown) =>
            setError(err instanceof Error ? err.message : "Failed to update template"),
        },
      );
    }
  };

  const handlePreview = () => {
    if (!template) {
      // In create mode we can't preview until saved (no id to call preview on).
      toast.info("Save the template first, then preview it.");
      return;
    }
    // The server merges any stored `variables[].example` values when rendering,
    // so unfilled tokens will render as literal {{token}} — intentional, lets
    // the admin spot missing data at preview time.
    previewTemplate.mutate(
      { id: template.id, variables: {} },
      {
        onSuccess: (data) => setPreview(data),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : "Preview failed"),
      },
    );
  };

  return (
    <>
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
              {mode === "create" ? "Create Notification Template" : "Edit Notification Template"}
            </h2>
            <p
              style={{
                fontFamily: SORA,
                fontSize: 16,
                color: SUB_TEXT,
                lineHeight: 1.4,
                maxWidth: 500,
              }}
            >
              Author the subject and body used when this template fires. Use{" "}
              <code style={{ fontFamily: "monospace", color: PRIMARY }}>{"{{name}}"}</code>{" "}
              tokens for values that should be substituted at send time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            aria-label="Close dialog"
            className="shrink-0 text-[#272727] transition-opacity hover:opacity-70"
          >
            <Icon icon="bitcoin-icons:cross-filled" width={24} height={24} />
          </button>
        </div>

        {/* Form sections */}
        <div className="mt-8 flex flex-col gap-6">
          {/* Template Name + Key */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel>Template Name</FieldLabel>
              <FigmaInput
                placeholder="Welcome Email"
                value={form.name}
                onChange={(value) => setForm((f) => ({ ...f, name: value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>
                Key
                {mode === "edit" && (
                  <span
                    style={{ fontFamily: INTER, fontSize: 12, color: SUB_TEXT, marginLeft: 8 }}
                  >
                    (immutable)
                  </span>
                )}
              </FieldLabel>
              <FigmaInput
                placeholder="welcome_email"
                value={form.key}
                onChange={(value) => setForm((f) => ({ ...f, key: value }))}
                disabled={mode === "edit"}
              />
            </div>
          </div>

          {/* Trigger Event */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Trigger Event</FieldLabel>
            <FigmaSelect
              value={form.triggerEvent}
              onChange={(v) =>
                setForm((f) => ({ ...f, triggerEvent: v as TriggerEvent }))
              }
              options={TRIGGER_EVENTS.map((t) => ({
                label: TRIGGER_EVENT_LABELS[t],
                value: t,
              }))}
            />
          </div>

          {/* Email Subject */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Email Subject</FieldLabel>
            <FigmaInput
              placeholder="Welcome to MBA Interview Prep, {{first_name}}!"
              value={form.emailSubject}
              onChange={(value) => setForm((f) => ({ ...f, emailSubject: value }))}
            />
          </div>

          {/* Email Body */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Email Body (HTML)</FieldLabel>
            <textarea
              ref={bodyRef}
              placeholder="<p>Hi {{name}},</p><p>Welcome to…</p>"
              value={form.emailBody}
              onChange={(e) =>
                setForm((f) => ({ ...f, emailBody: e.target.value }))
              }
              className="w-full resize-y outline-none"
              style={{
                minHeight: 220,
                borderRadius: 12,
                border: `0.4px solid ${BORDER}`,
                padding: "16px 20px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 13,
                color: TEXT,
                background: "#fafaff",
                lineHeight: 1.55,
              }}
            />

            {/* Available variables — click to insert at caret. Sourced from
                TRIGGER_EVENT_VARIABLES so the list stays accurate as the admin
                changes the trigger dropdown above. */}
            {availableVariables.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-[12px] border border-[#e6e6e6] bg-[#fafaff] p-3">
                <p
                  style={{
                    fontFamily: SORA,
                    fontSize: 13,
                    fontWeight: 500,
                    color: TEXT,
                  }}
                >
                  Available variables
                  <span
                    style={{
                      fontFamily: INTER,
                      fontSize: 12,
                      color: SUB_TEXT,
                      marginLeft: 8,
                      fontWeight: 400,
                    }}
                  >
                    — click to insert at cursor
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableVariables.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insertTokenIntoBody(v.name)}
                      title={v.description}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 transition-colors hover:bg-[#f0efff]"
                      style={{
                        border: `1px solid ${BORDER}`,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 12,
                        color: PRIMARY,
                      }}
                    >
                      <span>{`{{${v.name}}}`}</span>
                      <Icon
                        icon="mdi:plus"
                        width={14}
                        height={14}
                        className="text-[#868686] transition-colors group-hover:text-[#5450d8]"
                      />
                    </button>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: INTER,
                    fontSize: 12,
                    color: SUB_TEXT,
                    lineHeight: 1.45,
                  }}
                >
                  Hover any chip for a description of what it resolves to at
                  send time. Any token not in this list will be left as-is in
                  the rendered email.
                </p>
              </div>
            ) : (
              <div
                className="rounded-[12px] border border-dashed border-[#e0c097] bg-[#fff8eb] p-3"
                style={{
                  fontFamily: INTER,
                  fontSize: 12,
                  color: "#92651d",
                  lineHeight: 1.5,
                }}
              >
                No variables are passed for this trigger yet — any{" "}
                <code>{"{{token}}"}</code> in the body will render literally.
                Ship this template once a backend caller dispatches the trigger.
              </div>
            )}
          </div>

          {/* Active flag */}
          <label
            className="flex items-center justify-between gap-3 rounded-[12px] bg-[#fafaff] px-4 py-3"
            style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}
          >
            <span className="flex flex-col">
              <span className="font-medium">Active</span>
              <span className="text-[13px] text-[#868686]">
                Inactive templates are skipped by dispatch — the hardcoded fallback is used instead.
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="size-4 accent-[#5450d8]"
            />
          </label>

          {/* Preview */}
          {preview && (
            <div className="flex flex-col gap-2 rounded-[12px] border border-[#e6e6e6] bg-white p-4">
              <div className="flex items-center justify-between">
                <span
                  style={{ fontFamily: SORA, fontSize: 14, fontWeight: 600, color: TEXT }}
                >
                  Preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-[13px] text-[#868686] hover:text-[#272727]"
                >
                  Close preview
                </button>
              </div>
              <div className="text-[13px] text-[#808080]">
                <span className="font-medium text-[#272727]">Subject: </span>
                {preview.subject}
              </div>
              <iframe
                title="Template preview"
                sandbox=""
                srcDoc={preview.html}
                className="w-full rounded-[8px] border border-[#e6e6e6]"
                style={{ height: 320, background: "white" }}
              />
            </div>
          )}

          {error && (
            <p style={{ fontFamily: INTER, fontSize: 13, color: "#ef4444" }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-fit">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewTemplate.isPending}
              className="capitalize transition hover:bg-[#f5f5fb] disabled:opacity-60"
              style={{
                height: 52,
                borderRadius: 14,
                border: `1px solid ${PRIMARY}`,
                padding: "0 22px",
                fontFamily: INTER,
                fontSize: 15,
                fontWeight: 500,
                color: PRIMARY,
              }}
            >
              {previewTemplate.isPending ? "Rendering…" : "Preview"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose()}
            className="capitalize transition hover:bg-[#f5f5fb]"
            style={{
              height: 52,
              borderRadius: 14,
              border: `1px solid ${PRIMARY}`,
              padding: "0 22px",
              fontFamily: INTER,
              fontSize: 15,
              fontWeight: 500,
              color: PRIMARY,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="capitalize text-white transition disabled:opacity-60"
            style={{
              height: 52,
              borderRadius: 14,
              background: PRIMARY,
              padding: "0 28px",
              fontFamily: INTER,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create Template"
                : "Save Changes"}
          </button>
        </div>
    </>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SORA,
        fontSize: 15,
        color: TEXT,
        lineHeight: "normal",
        fontWeight: 500,
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
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full outline-none placeholder:text-[#868686] disabled:cursor-not-allowed disabled:bg-[#f5f5fb] ${className ?? ""}`}
      style={{
        height: 60,
        borderRadius: 12,
        border: `0.4px solid ${BORDER}`,
        padding: "16px 20px",
        fontFamily: INTER,
        fontSize: 16,
        color: TEXT,
        background: disabled ? "#f5f5fb" : "#ffffff",
        lineHeight: "30px",
      }}
    />
  );
}

function FigmaSelect<T extends string>({
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
        onChange={(e) => onChange(e.target.value as T)}
        className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
        style={{ fontFamily: INTER, fontSize: 16, color: TEXT, lineHeight: "30px" }}
      >
        {options.map((opt) => (
          <option
            key={String(opt.value)}
            value={opt.value}
            // Native <option> honors padding + line-height in Chromium/Firefox;
            // Safari ignores most of this but is still readable at the default.
            style={{
              padding: "10px 14px",
              fontFamily: INTER,
              fontSize: 15,
              color: TEXT,
              lineHeight: 1.6,
            }}
          >
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
