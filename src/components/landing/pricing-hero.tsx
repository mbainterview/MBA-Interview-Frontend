import { HeroBanner } from "@/components/landing/hero-banner";

const imgBadge = "/figma-assets/badge-icon-transparent-pricing.png";

export function PricingHero() {
  return (
    <HeroBanner
      badge={{ icon: imgBadge, text: "Transparent Pricing", iconWidth: 29, iconHeight: 26.574 }}
      title="Simple & Transparent Pricing"
      subtitle="Choose the plan that fits your preparation timeline. All plans include our core interview practice features."
    />
  );
}
