import { Navbar } from "@/components/landing/navbar";
import { PricingHero } from "@/components/landing/pricing-hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { PricingComparisonSection } from "@/components/landing/pricing-comparison-section";
import { PricingMobileSection } from "@/components/landing/pricing-mobile-section";
import { Footer } from "@/components/landing/footer";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">

        {/* ── Hero Banner ── */}
        <PricingHero />

        {/* ── Pricing Cards ── */}
        <PricingSection showHeading={false} />

        {/* ── Plan Comparison Table ── */}
        <PricingComparisonSection />

        {/* ── Mobile App Section ── */}
        <PricingMobileSection />

      </main>
      <Footer />
    </>
  );
}
