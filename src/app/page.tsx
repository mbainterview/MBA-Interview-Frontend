import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeaturesSection } from "@/components/landing/features-section";
import { SchoolsSection } from "@/components/landing/schools-section";
import { FeedbackSection } from "@/components/landing/feedback-section";
import { KiraSection } from "@/components/landing/kira-section";
import { MobileSection } from "@/components/landing/mobile-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <SchoolsSection />
        <FeedbackSection />
        <KiraSection />
        {/* Pricing hidden for beta — re-add <PricingSection /> when pricing goes live. */}
        <MobileSection />
      </main>
      <Footer />
    </>
  );
}
