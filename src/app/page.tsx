import { Navbar, BackgroundFX } from "@/components/landing/shared";
import { Hero, Choose, HowItWorks } from "@/components/landing/hero";
import { CompareSection } from "@/components/landing/compare-section";
import { Features, FAQ, Footer, CTA } from "@/components/landing/sections";

export default function Home() {
  return (
    <main className="relative flex-1">
      <BackgroundFX />
      <Navbar />
      <Hero />
      <Choose />
      <HowItWorks />
      <Features />
      <CompareSection />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  );
}
