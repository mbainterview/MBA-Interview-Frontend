import { HeroBanner } from "@/components/landing/hero-banner";

const imgBadge = "/figma-assets/badge-icon-simple-effective.png";

export function HowItWorksHero() {
  return (
    <HeroBanner
      variant="gradient"
      badge={{ icon: imgBadge, text: "Simple & Effective", iconWidth: 29, iconHeight: 22 }}
      title="How the Platform Works"
      subtitle="Master your MBA interviews in four simple steps. Our AI-powered platform guides you from nervous applicant to confident candidate."
      subtitleMaxWidth="570px"
    />
  );
}
