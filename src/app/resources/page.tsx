import { Navbar } from "@/components/landing/navbar";
import { ResourcesHero } from "@/components/landing/resources-hero";
import { ResourcesArticlesSection } from "@/components/landing/resources-articles-section";
import { PricingMobileSection } from "@/components/landing/pricing-mobile-section";
import { Footer } from "@/components/landing/footer";

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <ResourcesHero />
        <ResourcesArticlesSection />
        <PricingMobileSection />
      </main>
      <Footer />
    </>
  );
}
