"use client";

/**
 * ManagedForm — TanStack Form wrapper with shadcn UI styling.
 *
 * Usage:
 *   const form = useForm({ defaultValues, onSubmit, validators })
 *   <ManagedForm form={form}>
 *     <FormField form={form} name="email" label="Email">
 *       {(field) => <Input value={field.state.value} onChange={...} />}
 *     </FormField>
 *     <Button type="submit">Submit</Button>
 *   </ManagedForm>
 */

import { type AnyFieldApi, type AnyFormApi } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── ManagedForm ────────────────────────────────────────────────────────────

interface ManagedFormProps {
  form: AnyFormApi;
  children: React.ReactNode;
  className?: string;
}

export function ManagedForm({ form, children, className }: ManagedFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("space-y-4", className)}
    >
      {children}
    </form>
  );
}

// ─── FormField ───────────────────────────────────────────────────────────────

interface FormFieldProps {
  field: AnyFieldApi;
  label?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  field,
  label,
  description,
  className,
  children,
}: FormFieldProps) {
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label
          htmlFor={field.name as string}
          className={cn(hasError && "text-destructive")}
        >
          {label}
        </Label>
      )}
      {children}
      {description && !hasError && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {hasError && (
        <p className="text-xs text-destructive">
          {extractErrorMessages(field.state.meta.errors)}
        </p>
      )}
    </div>
  );
}

// ─── FieldInfo (inline error/status display) ─────────────────────────────────

function extractErrorMessages(errors: unknown[]): string {
  return errors
    .map((e) => {
      if (typeof e === "string") return e;
      if (e && typeof e === "object" && "message" in e) return (e as { message: string }).message;
      return String(e);
    })
    .join(", ");
}

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-xs text-destructive mt-1">
          {extractErrorMessages(field.state.meta.errors)}
        </p>
      )}
    </>
  );
}
