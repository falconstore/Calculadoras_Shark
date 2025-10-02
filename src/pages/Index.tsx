import { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { BetbraPromo } from "@/components/BetbraPromo";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components for better performance
const CalculatorTabs = lazy(() => import("@/components/CalculatorTabs").then(m => ({ default: m.CalculatorTabs })));
const CasasRegulamentadasWrapper = lazy(() => import("@/components/CasasRegulamentadasWrapper").then(m => ({ default: m.CasasRegulamentadasWrapper })));
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("@/components/Contact").then(m => ({ default: m.Contact })));

const LoadingSection = () => (
  <div className="py-20 px-4">
    <div className="container mx-auto space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Promoção Betbra */}
      <BetbraPromo />
      
      {/* Calculadoras em Abas */}
      <Suspense fallback={<LoadingSection />}>
        <CalculatorTabs />
      </Suspense>

      {/* Casas Regulamentadas */}
      <Suspense fallback={<LoadingSection />}>
        <CasasRegulamentadasWrapper />
      </Suspense>
      
      {/* Sobre e Contato */}
      <Suspense fallback={<LoadingSection />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<LoadingSection />}>
        <Contact />
      </Suspense>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border/50">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Shark Calculadoras - Ferramentas Profissionais de Apostas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
