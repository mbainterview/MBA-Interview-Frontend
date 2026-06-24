import { Navbar } from "@/components/landing/navbar";
import { HowItWorksHero } from "@/components/landing/how-it-works-hero";
import { HowItWorksStepsSection } from "@/components/landing/how-it-works-steps-section";
import { KiraHowItWorksSection, type SimCard } from "@/components/landing/kira-how-it-works-section";
import { PricingMobileSection } from "@/components/landing/pricing-mobile-section";
import { Footer } from "@/components/landing/footer";

const imgBadge   = "/figma-assets/6a8da5ca-93fc-4eda-b066-e07b0b43586b.png";
const imgMessage = "/figma-assets/how-it-works/message.svg";
const imgClock   = "/figma-assets/how-it-works/clock.svg";
const imgMic     = "/figma-assets/how-it-works/mic.svg";
const imgUnion   = "/figma-assets/how-it-works/union.png";

const SIMULATION_CARDS: SimCard[] = [
  {
    bg: "#edecfd",
    icon: imgMessage,
    title: "Question Format",
    desc: "Practice the most common MBA interview questions and build confidence in structuring your response.",
  },
  {
    bg: "#edecfd",
    icon: imgClock,
    title: "Timed Responses",
    desc: "Practice under realistic time constraints. Most responses are 60–90 seconds to simulate real conditions.",
  },
  {
    bg: "#f9f9f9",
    icon: imgMic,
    title: "Multiple Response Modes",
    desc: "Choose between video recording, audio-only, or text responses based on your comfort level.",
    wide: true,
    union: imgUnion,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <HowItWorksHero />
        <HowItWorksStepsSection />
        <KiraHowItWorksSection
          badgeIcon={imgBadge}
          badgeText="Realistic Practice"
          heading="Interview Simulation Details"
          subtitle="Build foundational skills that lead to interview success."
          cards={SIMULATION_CARDS}
        />
        <PricingMobileSection />
      </main>
      <Footer />
    </>
  );
}
