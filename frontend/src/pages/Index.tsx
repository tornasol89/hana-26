import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustSection from "@/components/landing/TrustSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

// Orden narrativo:
// Hero (propuesta de valor) → Trust (por qué confiar) → Categories (qué ofrecemos)
// → How It Works (cómo funciona) → Testimonials (prueba social) → CTA (convertir)

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />        {/* bg-gradient-warm */}
      <TrustSection />       {/* bg-background     */}
      <CategoriesSection />  {/* bg-gradient-warm  */}
      <HowItWorksSection />  {/* bg-background     */}
      <TestimonialsSection />{/* bg-secondary/30   */}
      <CTASection />         {/* bg-gradient-hero  */}
      <Footer />             {/* #0f0a1a dark       */}
    </div>
  );
};

export default Index;
