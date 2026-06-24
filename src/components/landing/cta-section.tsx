import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center md:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,oklch(1_0_0/0.08),transparent)]"
          />

          <h2 className="relative text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Start Practicing for Free Today
          </h2>
          <p className="relative mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Join 100,000+ applicants who used our platform to get admitted to
            their dream business school.
          </p>

          <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 font-semibold bg-white text-primary hover:bg-white/90"
              nativeButton={false} render={<Link href="/sign-in" />}
            >
              Start Practice
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              nativeButton={false} render={<Link href="/pricing" />}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
