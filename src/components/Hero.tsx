import { Button } from "./ui/button";
import sharkLogo from "@/assets/shark-logo.png";

export const Hero = () => {
  const scrollToCalculators = () => {
    document.getElementById("calculadoras")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-8 pt-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          {/* Logo Grande */}
          <div className="flex justify-center mb-4">
            <img 
              src={sharkLogo} 
              alt="Shark 100% Green" 
              className="h-32 md:h-44 w-auto drop-shadow-2xl animate-float"
            />
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-gradient">Shark 100%</span>
            <span className="text-foreground"> Green</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Calculadoras Profissionais para{" "}
            <span className="text-primary font-bold">Apostas Esportivas</span>
          </p>

          {/* CTA */}
          <div className="flex gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={scrollToCalculators}
              className="gradient-glow text-lg px-8 py-6 font-bold"
            >
              Ver Calculadoras
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

    </section>
  );
};
