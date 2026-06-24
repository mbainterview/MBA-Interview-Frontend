import { HeroBanner } from "@/components/landing/hero-banner";

const imgBadge = "/figma-assets/badge-icon-expert-resources.png";

export function ResourcesHero() {
  return (
    <HeroBanner
      badge={{ icon: imgBadge, text: "Expert Resources", iconWidth: 29, iconHeight: 30 }}
      title={<>MBA Interview &amp; Kira Resources</>}
      subtitle="Expert guides, tips, and insights to help you ace your MBA interviews and Kira assessments."
    />
  );
}
