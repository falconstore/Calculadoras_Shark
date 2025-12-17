import { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { BetbraPromo } from "@/components/BetbraPromo";
import { Skeleton } from "@/components/ui/skeleton";
import sharkLogo from "@/assets/shark-logo.png";

// Lazy load heavy components for better performance
const CalculatorTabs = lazy(() => import("@/components/CalculatorTabs").then(m => ({
  default: m.CalculatorTabs
})));
const HandicapTabs = lazy(() => import("@/components/HandicapTabs").then(m => ({
  default: m.HandicapTabs
})));
const About = lazy(() => import("@/components/About").then(m => ({
  default: m.About
})));
const Contact = lazy(() => import("@/components/Contact").then(m => ({
  default: m.Contact
})));
const LoadingSection = () => <div className="py-20 px-4">
    <div className="container mx-auto space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>;
const Index = () => {
  return <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Promoção Betbra */}
      <BetbraPromo />
      
      {/* Calculadoras em Abas */}
      <Suspense fallback={<LoadingSection />}>
        <CalculatorTabs />
      </Suspense>

      {/* Handicap e Casas Regulamentadas */}
      <Suspense fallback={<LoadingSection />}>
        <HandicapTabs />
      </Suspense>
      
      {/* Sobre e Contato */}
      <Suspense fallback={<LoadingSection />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<LoadingSection />}>
        <Contact />
      </Suspense>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t border-border/50">
        <div className="container mx-auto flex flex-col items-center gap-4">
          <img src={sharkLogo} alt="Shark 100% Green" className="h-16 w-auto opacity-80" />
          <p className="text-muted-foreground text-center">© 2023 Shark 100% Green - Ferramentas Profissionais de Apostas<span className="font-bold text-foreground">Shark 100% Green</span> - Ferramentas Profissionais de Apostas
          </p>
          <p className="text-sm text-muted-foreground/70">Calculadoras ArbiPro & FreePro</p>
        </div>
      </footer>
    </div>;
};
export default Index;