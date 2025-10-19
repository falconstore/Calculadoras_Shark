import { Calculator, TrendingUp, Shield } from "lucide-react";
import { Button } from "./ui/button";
import sharkWatermark from "@/assets/shark-watermark.png";

export const Hero = () => {
  const scrollToCalculators = () => {
    document.getElementById("calculadoras")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo/Brand */}
          <div className="inline-block">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">
              <span className="text-gradient">Shark</span>
              <span className="text-foreground"> Calculadoras</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
            Ferramentas Profissionais para{" "}
            <span className="text-primary font-bold">Otimização de Apostas</span>
          </p>

          {/* Features */}
          <div className="relative">
            {/* Marca d'água */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
              style={{ zIndex: 0 }}
            >
              <img 
                src={sharkWatermark} 
                alt="Shark Watermark" 
                className="opacity-[0.15] max-w-[50%] max-h-[50%] object-contain"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 py-8 relative" style={{ zIndex: 1 }}>
              <div className="glass-card p-6 rounded-xl glow-hover">
                <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Calculadoras Avançadas</h3>
                <p className="text-sm text-muted-foreground">
                  ArbiPro e FreePro para cálculos precisos
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl glow-hover">
                <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">ROI Otimizado</h3>
                <p className="text-sm text-muted-foreground">
                  Maximize seus lucros com estratégias comprovadas
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl glow-hover">
                <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Casas Regulamentadas</h3>
                <p className="text-sm text-muted-foreground">
                  Apenas plataformas verificadas e seguras
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={scrollToCalculators}
              className="gradient-glow text-lg px-8 py-6 font-bold"
            >
              Começar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 text-lg px-8 py-6"
              onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
