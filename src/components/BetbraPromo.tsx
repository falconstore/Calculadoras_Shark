import { Percent, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const BetbraPromo = () => {
  const handleClick = () => {
    // Link de indicação será adicionado aqui
    window.open("SEU_LINK_DE_INDICACAO_AQUI", "_blank");
  };

  return (
    <section className="py-12 px-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.4)] transition-all duration-300">
          {/* Badge Exclusivo */}
          <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            Exclusivo
          </Badge>

          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Ícone */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Percent className="w-10 h-10 text-primary" strokeWidth={2.5} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Comissão Especial Betbra
                </h3>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  Cadastre-se usando nosso link exclusivo e aproveite uma comissão diferenciada
                </p>

                {/* Comparação de Comissões */}
                <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary flex items-center gap-1">
                      2.8%
                      <span className="text-lg text-green-500">✓</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Com nosso link</div>
                  </div>
                  
                  <div className="text-2xl text-muted-foreground/30">vs</div>
                  
                  <div className="text-center opacity-60">
                    <div className="text-3xl font-bold text-muted-foreground">4.5%</div>
                    <div className="text-xs text-muted-foreground mt-1">Sem o link</div>
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  onClick={handleClick}
                  size="lg"
                  className="group hover-scale"
                >
                  Cadastrar com Desconto
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        </Card>
      </div>
    </section>
  );
};
