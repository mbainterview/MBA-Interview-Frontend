"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";
const PRIMARY = "#5450d8";
const TEXT_DARK = "#222c44";
const TEXT_BODY = "#5b5b6b";

export default function CancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md rounded-[20px] bg-white p-8 text-center"
        style={{ boxShadow: "0 12px 32px rgba(15, 11, 56, 0.08)" }}
      >
        <h1
          style={{
            fontFamily: sora,
            fontSize: "24px",
            fontWeight: 700,
            color: TEXT_DARK,
          }}
        >
          Checkout cancelled
        </h1>
        <p
          className="mt-3"
          style={{ fontFamily: inter, fontSize: "14px", color: TEXT_BODY, lineHeight: 1.5 }}
        >
          No charges were made. You can pick up where you left off at any time.
        </p>

        <Link
          href="/billing"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] px-5 text-white transition"
          style={{
            height: 44,
            fontFamily: sora,
            fontSize: "14px",
            fontWeight: 600,
            background: PRIMARY,
          }}
        >
          Back to billing
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
