"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useSignIn } from "@/services/auth.service";
import { FieldInfo } from "@/components/shared/managed-form";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

// ── Assets (Figma node 812:5717, fetched 2026-03-30) ─────────────────────────
const logoMask  = "/figma-assets/ad82c1b5-4e3d-40db-921e-2351e6ee095c.png";
const eyeIcon   = "/figma-assets/5671f5b6-0d56-437f-987b-224495dcc28d.svg";
const bulletDot = "/figma-assets/cd9cf952-ab83-4cd6-94a2-dfdd007404b4.svg";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

// ── Validation ────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  email:    z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  height: "65px",
  borderRadius: "12px",
  border: "0.4px solid #808080",
  padding: "16px 20px",
  fontFamily: inter,
  fontSize: "14px",
  color: "#272727",
  outline: "none",
  width: "100%",
  background: "white",
  lineHeight: "30px",
};

const schools = [
  "Harvard Interview Prep",
  "Stanford Interview Prep",
  "INSEAD Interview Prep",
  "Wharton Interview Prep",
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { mutate: signIn, isPending } = useSignIn();

  const form = useForm({
    defaultValues: { email: "sarah@test.com", password: "Test@1234" },
    onSubmit: async ({ value }) => {
      signIn(value, {
        onSuccess: async (data) => {
          // Wait for fresh /auth/me before navigating so we route based on
          // the actual onboarding state, not stale cached state.
          const user = await login(data);
          const onboarding = user?.onboarding;
          if (onboarding && !onboarding.completed) {
            const stepRoute: Record<string, string> = {
              welcome: "/onboarding",
              profile: "/onboarding/profile",
              resume: "/onboarding/resume",
              schools: "/onboarding/schools",
              goals: "/onboarding/goals",
              diagnostic: "/onboarding/diagnostic",
            };
            router.push(stepRoute[onboarding.step] ?? "/onboarding");
          } else {
            router.push("/dashboard");
          }
        },
        onError: (error: any) =>
          toast.error(error?.message || "Invalid email or password."),
      });
    },
  });

  return (
    <div className="min-h-screen bg-white flex items-start lg:items-center">
      <div
        className="w-full flex items-start lg:items-center py-10"
        style={{ maxWidth: "1440px", margin: "0 auto" }}
      >
        {/* ── Left purple card ─────────────────────────────────────────── */}
        {/* Figma 812:5717 — content frame (812:12947) is top-anchored at y=128 inside the 887px card */}
        <div
          className="hidden lg:flex ml-7 rounded-[30px] flex-col items-center gap-29 pt-32 pb-0"
          style={{ background: "#5450d8", width: "681px", minHeight: "887px", flexShrink: 0 }}
        >
          {/* Logo — masked white div (node 805:1275) */}
          <div style={{ position: "relative", width: "247px", height: "126px", flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: "0.79% 0 0 0.81%",
                background: "white",
                maskImage: `url('${logoMask}')`,
                maskRepeat: "no-repeat",
                maskPosition: "-2px -1px",
                maskSize: "247px 126px",
                WebkitMaskImage: `url('${logoMask}')`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "-2px -1px",
                WebkitMaskSize: "247px 126px",
              }}
            />
          </div>

          {/* Text + school list */}
          <div className="flex flex-col gap-10 items-start" style={{ width: "526px" }}>
            <div className="flex flex-col gap-6 items-center text-center w-full">
              <h2
                style={{
                  fontFamily: sora,
                  fontSize: "40px",
                  fontWeight: 600,
                  color: "white",
                  lineHeight: "1.3",
                  width: "100%",
                }}
              >
                Ace Your MBA Interview with AI-Powered Prep
              </h2>
              <p style={{ fontFamily: inter, fontSize: "20px", color: "rgba(255,255,255,0.8)", lineHeight: "1.3", width: "100%" }}>
                Practice with school-specific questions, get instant AI
                feedback, and track your progress to interview day.
              </p>
            </div>

            {/* School bullet list */}
            <div className="flex flex-col" style={{ gap: "17.657px" }}>
              {schools.map((school) => (
                <div key={school} className="flex items-center" style={{ gap: "13.243px" }}>
                  <img
                    src={bulletDot}
                    alt=""
                    style={{ width: "13.243px", height: "13.243px", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: "20px",
                      fontWeight: 500,
                      color: "white",
                      lineHeight: "1.3",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {school}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
          <div
            className="flex flex-col gap-12 items-center w-full"
            style={{ maxWidth: "549px" }}
          >
            {/* Brand greeting */}
            <p
              className="text-center"
              style={{ fontFamily: sora, fontSize: "40px", fontWeight: 600, color: "#222c44", lineHeight: "1.3" }}
            >
              Welcome back
            </p>

            {/* Heading + subtitle */}
            <div className="flex flex-col gap-3 items-center text-center">
              <h1 style={{ fontFamily: sora, fontSize: "32px", fontWeight: 600, color: "#222c44", lineHeight: "1.3" }}>
                Sign In
              </h1>
              <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.3" }}>
                Sign in to continue your interview preparation
              </p>
            </div>

            {/* Form */}
            <form
              className="flex flex-col gap-12 items-center w-full"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              {/* Fields */}
              <div className="flex flex-col gap-5 w-full">

                {/* Email */}
                <form.Field
                  name="email"
                  validators={{ onChange: signInSchema.shape.email }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-3">
                      <label
                        htmlFor="email"
                        style={{ fontFamily: sora, fontSize: "18px", fontWeight: 400, color: "#222c44" }}
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="john@gmail.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="placeholder:text-[#808080]"
                        style={inputStyle}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                {/* Password + forgot */}
                <form.Field
                  name="password"
                  validators={{ onChange: signInSchema.shape.password }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-3">
                      <label
                        htmlFor="password"
                        style={{ fontFamily: sora, fontSize: "18px", fontWeight: 400, color: "#222c44" }}
                      >
                        Password
                      </label>
                      <div
                        style={{
                          height: "65px",
                          borderRadius: "12px",
                          border: "0.4px solid #808080",
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          background: "white",
                        }}
                      >
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="flex-1 placeholder:text-[#808080]"
                          style={{
                            border: "none",
                            outline: "none",
                            fontFamily: inter,
                            fontSize: "14px",
                            color: "#272727",
                            background: "transparent",
                            lineHeight: "30px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <img src={eyeIcon} alt="" style={{ width: "24px", height: "24px", display: "block" }} />
                        </button>
                      </div>
                      <FieldInfo field={field} />
                      {/* Forgot password — right-aligned, below field */}
                      <div className="flex justify-end">
                        <Link
                          href="/forgot-password"
                          style={{ fontFamily: sora, fontSize: "14px", fontWeight: 400, color: "#808080" }}
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-5 items-center w-full">
                <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
                  {({ canSubmit, isSubmitting }) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || isPending}
                      style={{
                        background: "#5450d8",
                        borderRadius: "16px",
                        padding: "18px 32px",
                        width: "100%",
                        fontFamily: inter,
                        fontSize: "20px",
                        fontWeight: 500,
                        color: "white",
                        border: "none",
                        cursor: canSubmit && !isSubmitting && !isPending ? "pointer" : "not-allowed",
                        opacity: isSubmitting || isPending ? 0.7 : 1,
                        transition: "opacity 0.2s",
                        lineHeight: "28px",
                      }}
                    >
                      {isSubmitting || isPending ? "Signing in…" : "Sign In"}
                    </button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
