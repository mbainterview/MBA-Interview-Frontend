"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useSignIn } from "@/services/auth.service";
import { FieldInfo } from "@/components/shared/managed-form";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const inputStyle: React.CSSProperties = {
  height: "56px",
  borderRadius: "12px",
  border: "1px solid #e2e2f0",
  padding: "14px 18px",
  fontFamily: inter,
  fontSize: "15px",
  color: "#272727",
  outline: "none",
  width: "100%",
  background: "white",
  lineHeight: "28px",
};

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth();
  const { mutate: signIn, isPending } = useSignIn();

  // If already authenticated as admin, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const form = useForm({
    defaultValues: { email: "admin@mbaprep.com", password: "12345678" },
    onSubmit: async ({ value }) => {
      signIn(value, {
        onSuccess: async (data) => {
          await login(data);
          // Redirect will be handled by the admin layout role guard
          router.push("/admin/dashboard");
        },
        onError: (error: any) =>
          toast.error(error?.message || "Invalid credentials. Admin access only."),
      });
    },
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#eaf0fe" }}
    >
      <div
        className="w-full max-w-115 rounded-[24px] bg-white px-10 py-12"
        style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex h-18 w-18 items-center justify-center rounded-full"
            style={{ background: "#5450d8" }}
          >
            <ShieldCheck size={36} className="text-white" />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontFamily: sora,
                fontSize: "28px",
                fontWeight: 600,
                color: "#222c44",
                lineHeight: 1.3,
              }}
            >
              Admin Login
            </h1>
            <p
              className="mt-2"
              style={{
                fontFamily: inter,
                fontSize: "16px",
                color: "#868686",
                lineHeight: 1.4,
              }}
            >
              Sign in to the admin dashboard
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          className="mt-10 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Email */}
          <form.Field
            name="email"
            validators={{ onChange: loginSchema.shape.email }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-email"
                  style={{
                    fontFamily: sora,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#222c44",
                  }}
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="placeholder:text-[#b5b5b5] transition-colors focus:border-[#5450d8]"
                  style={inputStyle}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          {/* Password */}
          <form.Field
            name="password"
            validators={{ onChange: loginSchema.shape.password }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-password"
                  style={{
                    fontFamily: sora,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#222c44",
                  }}
                >
                  Password
                </label>
                <div
                  className="flex items-center transition-colors"
                  style={{
                    ...inputStyle,
                    display: "flex",
                    padding: "0 18px",
                  }}
                >
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex-1 placeholder:text-[#b5b5b5]"
                    style={{
                      border: "none",
                      outline: "none",
                      fontFamily: inter,
                      fontSize: "15px",
                      color: "#272727",
                      background: "transparent",
                      lineHeight: "28px",
                      height: "100%",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="ml-2 text-[#868686] transition-colors hover:text-[#5450d8]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          {/* Submit */}
          <form.Subscribe
            selector={(s) => ({
              canSubmit: s.canSubmit,
              isSubmitting: s.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
                className="mt-4 w-full transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "#5450d8",
                  borderRadius: "14px",
                  padding: "16px 32px",
                  fontFamily: inter,
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "white",
                  border: "none",
                  cursor:
                    canSubmit && !isSubmitting && !isPending
                      ? "pointer"
                      : "not-allowed",
                  lineHeight: "28px",
                }}
              >
                {isSubmitting || isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            )}
          </form.Subscribe>
        </form>

        {/* Footer */}
        <p
          className="mt-8 text-center"
          style={{
            fontFamily: inter,
            fontSize: "13px",
            color: "#b5b5b5",
          }}
        >
          This area is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
