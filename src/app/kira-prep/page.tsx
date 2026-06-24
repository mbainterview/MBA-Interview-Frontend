import { Navbar } from "@/components/landing/navbar";
import { HeroBanner } from "@/components/landing/hero-banner";
import { KiraSection } from "@/components/landing/kira-section";
import { KiraHowItWorksSection } from "@/components/landing/kira-how-it-works-section";
import { KiraInterfaceSection } from "@/components/landing/kira-interface-section";
import { KiraHistorySection } from "@/components/landing/kira-history-section";
import { Footer } from "@/components/landing/footer";

export default function KiraPrepPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <HeroBanner
          badge={{
            icon: "/figma-assets/badge-icon-video-essay.png",
            text: "Video Essay Prep",
            iconWidth: 27,
            iconHeight: 26,
          }}
          title="Kira Video Essay Practice Made Simple"
          subtitle="Master the video interview format used by top MBA programs. Practice under real conditions and get AI-powered feedback."
          cta={{ label: "Start Practice", href: "/sign-in" }}
        />

        {/* Section 1 — Master the Kira Video Interview (reuse landing section) */}
        <KiraSection />

        {/* Section 2 — How Kira Practice Works */}
        <KiraHowItWorksSection />

        {/* Section 3 — Practice Interface */}
        <KiraInterfaceSection />

        {/* Section 4 — Practice History */}
        <KiraHistorySection />

      </main>
      <Footer />
    </>
  );
}
